#!/usr/bin/env node
/**
 * Migrates WordPress WXR export into Astro content collections.
 * Usage: node scripts/migrate-wordpress.mjs [path-to-xml]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LIVE = 'https://woonsprint.nl';
const XML_PATH =
  process.argv[2] ||
  path.resolve(process.env.HOME, 'Downloads/woonsprintnl.WordPress.2026-06-29.xml');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const AUTHORS_DIR = path.join(ROOT, 'src/content/authors');
const CATEGORIES_DIR = path.join(ROOT, 'src/content/categories');
const TAGS_DIR = path.join(ROOT, 'src/content/tags');
const UPLOADS_DIR = path.join(ROOT, 'public/wp-content/uploads');
const DEFAULT_FEATURED = '/wp-content/uploads/2022/11/Frame1.svg';

const WP_NS = {
  content: 'http://purl.org/rss/1.0/modules/content/',
  excerpt: 'http://wordpress.org/export/1.2/excerpt/',
  wp: 'http://wordpress.org/export/1.2/',
  dc: 'http://purl.org/dc/elements/1.1/',
};

function stripCDATA(text) {
  if (!text) return '';
  return text.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function escapeYaml(value) {
  if (value == null) return '""';
  const str = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${str}"`;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve(dest);
      return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    proto
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 WoonsprintMigration/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          downloadFile(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });
}

function wpUrlToLocal(url) {
  if (!url) return url;
  const match = String(url).match(/wp-content\/uploads\/(.+?)(?:\?|$)/i);
  if (!match) return url;
  return `/wp-content/uploads/${match[1]}`;
}

function localUploadPath(url) {
  const local = wpUrlToLocal(url);
  if (!local.startsWith('/wp-content/')) return null;
  return path.join(ROOT, 'public', local);
}

async function ensureLocalImage(url) {
  if (!url || !url.includes('wp-content/uploads/')) return url;
  const localPath = localUploadPath(url);
  if (!localPath) return url;
  const fullUrl = url.startsWith('http') ? url : `${LIVE}${url.startsWith('/') ? '' : '/'}${url}`;
  try {
    await downloadFile(fullUrl, localPath);
    return wpUrlToLocal(url);
  } catch {
    return wpUrlToLocal(url);
  }
}

function normalizeSiteUrls(html) {
  if (!html) return '';
  let out = html;
  out = out.replace(/https?:\/\/woonsprint\.nl/gi, '');
  out = out.replace(/src="\/\/woonsprint\.nl/gi, 'src="');
  out = out.replace(/href="\/\/woonsprint\.nl/gi, 'href="');
  return out;
}

async function localizeContentImages(html) {
  let out = normalizeSiteUrls(html);
  const urls = new Set();
  for (const m of html.matchAll(/https?:\/\/woonsprint\.nl\/wp-content\/uploads\/[^\s"'<>]+/gi)) {
    urls.add(m[0]);
  }
  for (const m of html.matchAll(/\/wp-content\/uploads\/[^\s"'<>]+/gi)) {
    urls.add(`${LIVE}${m[0]}`);
  }
  for (const url of urls) {
    const local = await ensureLocalImage(url);
    out = out.split(url.replace(LIVE, '')).join(local);
    out = out.split(url).join(local);
  }
  return out;
}

function extractMeta(item, key) {
  for (const meta of item.getElementsByTagNameNS(WP_NS.wp, 'postmeta')) {
    const mk = meta.getElementsByTagNameNS(WP_NS.wp, 'meta_key')[0];
    const mv = meta.getElementsByTagNameNS(WP_NS.wp, 'meta_value')[0];
    if (mk && mv && stripCDATA(mk.textContent) === key) {
      return stripCDATA(mv.textContent);
    }
  }
  return '';
}

function getText(el, ns, tag) {
  const node = el.getElementsByTagNameNS(ns, tag)[0];
  return node ? stripCDATA(node.textContent) : '';
}

function sanitizeForMdx(html) {
  if (!html) return '';
  let out = html;
  // WordPress block comments break MDX parsing
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  // Elementor/style blocks break MDX
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Body h1 duplicates layout title — normalize to h2 on one line
  out = out.replace(/<h1\b([^>]*)>\s*([\s\S]*?)\s*<\/h1>/gi, (_, attrs, text) =>
    `<h2${attrs}>${text.replace(/\s+/g, ' ').trim()}</h2>`,
  );
  out = out.replace(/<h1\b([^>]*)>\s*([^<\n]+)/gi, (_, attrs, text) =>
    `<h2${attrs}>${text.trim()}</h2>`,
  );
  out = out.replace(/<h2\b([^>]*)>\s*([\s\S]*?)\s*<\/h2>/gi, (_, attrs, text) =>
    `<h2${attrs}>${text.replace(/\s+/g, ' ').trim()}</h2>`,
  );
  // Escape curly braces that MDX would parse as JSX (in remaining inline CSS etc.)
  out = out.replace(/\{(?![^<]*>)/g, '&#123;');
  out = out.replace(/\}(?![^<]*>)/g, '&#125;');
  // Normalize indentation — leading tabs break MDX HTML block parsing
  out = out
    .split('\n')
    .map((line) => line.replace(/^\t+/, '').trimEnd())
    .join('\n');
  return out.trim();
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  console.log('Reading XML:', XML_PATH);
  const xml = fs.readFileSync(XML_PATH, 'utf8');

  const { DOMParser } = await import('@xmldom/xmldom');
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const channel = doc.getElementsByTagName('channel')[0];
  const items = channel.getElementsByTagName('item');

  const authors = new Map();
  for (const author of doc.getElementsByTagNameNS(WP_NS.wp, 'author')) {
    const login = getText(author, WP_NS.wp, 'author_login');
    const display = getText(author, WP_NS.wp, 'author_display_name') || login;
    if (login) authors.set(login, display);
  }

  const attachmentMap = new Map();
  const allAttachmentUrls = new Set();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const type = getText(item, WP_NS.wp, 'post_type');
    if (type !== 'attachment') continue;
    const id = getText(item, WP_NS.wp, 'post_id');
    const url =
      getText(item, WP_NS.wp, 'attachment_url') ||
      getText(item, null, 'guid') ||
      getText(item, WP_NS.content, 'encoded');
    if (id && url) {
      attachmentMap.set(id, url);
      allAttachmentUrls.add(url);
    }
  }

  const categories = new Map();
  const tags = new Map();

  for (const cat of doc.getElementsByTagNameNS(WP_NS.wp, 'category')) {
    const slug = getText(cat, WP_NS.wp, 'category_nicename');
    const name = getText(cat, WP_NS.wp, 'cat_name');
    if (slug) categories.set(slug, name || slug);
  }
  for (const tag of doc.getElementsByTagNameNS(WP_NS.wp, 'tag')) {
    const slug = getText(tag, WP_NS.wp, 'tag_slug');
    const name = getText(tag, WP_NS.wp, 'tag_name');
    if (slug) tags.set(slug, name || slug);
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.mkdirSync(AUTHORS_DIR, { recursive: true });
  fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
  fs.mkdirSync(TAGS_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      fs.unlinkSync(path.join(BLOG_DIR, file));
    }
  }

  const imageUrls = new Set(allAttachmentUrls);
  let postCount = 0;
  const authorUsage = new Map();
  const categoryUsage = new Map();
  const tagUsage = new Map();
  const slugs = new Set();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const type = getText(item, WP_NS.wp, 'post_type');
    const status = getText(item, WP_NS.wp, 'status');
    if (type !== 'post' || status !== 'publish') continue;

    const slug = getText(item, WP_NS.wp, 'post_name');
    if (!slug || slugs.has(slug)) continue;
    slugs.add(slug);

    const title = stripCDATA(item.getElementsByTagName('title')[0]?.textContent || '');
    const rawContent = getText(item, WP_NS.content, 'encoded');
    const excerpt = getText(item, WP_NS.excerpt, 'encoded');
    const pubDate = getText(item, WP_NS.wp, 'post_date');
    const modified = getText(item, WP_NS.wp, 'post_modified');
    const creator = getText(item, WP_NS.dc, 'creator');
    const author = authors.get(creator) || creator || 'admin';

    authorUsage.set(author, (authorUsage.get(author) || 0) + 1);

    const postCategories = [];
    const postTags = [];
    for (const cat of item.getElementsByTagName('category')) {
      const domain = cat.getAttribute('domain');
      const nicename = cat.getAttribute('nicename');
      const label = stripCDATA(cat.textContent);
      if (domain === 'category' && nicename) {
        postCategories.push(label || categories.get(nicename) || nicename);
        categoryUsage.set(nicename, label || nicename);
      }
      if (domain === 'post_tag' && nicename) {
        postTags.push(label || tags.get(nicename) || nicename);
        tagUsage.set(nicename, label || nicename);
      }
    }

    const thumbId = extractMeta(item, '_thumbnail_id');
    let featuredImage = thumbId ? attachmentMap.get(thumbId) : '';
    if (!featuredImage) {
      const imgMatch = rawContent.match(
        /src="(https?:\/\/woonsprint\.nl\/wp-content\/uploads\/[^"]+)"/i,
      );
      featuredImage = imgMatch ? imgMatch[1] : '';
    }
    if (!featuredImage) {
      const imgMatch = rawContent.match(/src="(\/wp-content\/uploads\/[^"]+)"/i);
      featuredImage = imgMatch ? `${LIVE}${imgMatch[1]}` : '';
    }

    for (const match of rawContent.matchAll(/https?:\/\/woonsprint\.nl\/wp-content\/uploads\/[^\s"'<>]+/gi)) {
      imageUrls.add(match[0]);
    }
    if (featuredImage) imageUrls.add(featuredImage);

    const isoDate = pubDate ? pubDate.replace(' ', 'T') : '';
    const isoUpdated = modified ? modified.replace(' ', 'T') : isoDate;
    const description = stripTags(excerpt) || stripTags(rawContent).slice(0, 280) || title;

    const localFeatured = featuredImage
      ? wpUrlToLocal(await ensureLocalImage(featuredImage))
      : DEFAULT_FEATURED;

    const body = `<div class="wp-content">\n${sanitizeForMdx(await localizeContentImages(rawContent))}\n</div>`;

    const frontmatter = [
      '---',
      `title: ${escapeYaml(title)}`,
      `description: ${escapeYaml(description)}`,
      `pubDate: ${isoDate}`,
      isoUpdated !== isoDate ? `updatedDate: ${isoUpdated}` : null,
      `author: ${escapeYaml(author)}`,
      postCategories.length ? `categories:\n${postCategories.map((c) => `  - ${escapeYaml(c)}`).join('\n')}` : null,
      postTags.length ? `tags:\n${postTags.map((t) => `  - ${escapeYaml(t)}`).join('\n')}` : null,
      `featuredImage: ${escapeYaml(localFeatured)}`,
      '---',
    ]
      .filter(Boolean)
      .join('\n');

    fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), `${frontmatter}\n\n${body}\n`, 'utf8');
    postCount++;
    console.log(`  Wrote ${slug}.md`);
  }

  console.log(`Wrote ${postCount} blog posts to ${BLOG_DIR}`);

  for (const [login, display] of authors) {
    if (authorUsage.has(display) || [...authors.values()].includes(display)) {
      fs.writeFileSync(
        path.join(AUTHORS_DIR, `${login}.json`),
        JSON.stringify({ login, displayName: display }, null, 2),
      );
    }
  }

  for (const [slug, name] of categoryUsage) {
    fs.writeFileSync(
      path.join(CATEGORIES_DIR, `${slug}.json`),
      JSON.stringify({ slug, name }, null, 2),
    );
  }

  for (const [slug, name] of tagUsage) {
    fs.writeFileSync(path.join(TAGS_DIR, `${slug}.json`), JSON.stringify({ slug, name }, null, 2));
  }

  console.log(`Downloading ${imageUrls.size} unique images...`);
  let downloaded = 0;
  let failed = 0;
  for (const url of imageUrls) {
    try {
      await ensureLocalImage(url);
      downloaded++;
      if (downloaded % 25 === 0) console.log(`  ${downloaded}/${imageUrls.size}`);
    } catch {
      failed++;
    }
  }

  console.log(`Images: ${downloaded} processed, ${failed} failed`);
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
