#!/usr/bin/env node
/**
 * Migrates blog posts from woonsprint.nl WordPress REST API.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const LIVE = 'https://woonsprint.nl';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 WoonsprintMigration/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchJson(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(JSON.parse(data)));
      })
      .on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve(dest);
      return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
      .on('error', reject);
  });
}

function escapeYaml(value) {
  if (value == null) return '""';
  const str = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${str}"`;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wpUrlToLocal(url) {
  const match = url.match(/wp-content\/uploads\/(.+)$/i);
  if (!match) return url;
  return `/wp-content/uploads/${match[1]}`;
}

async function localizeImage(url) {
  if (!url || !url.includes('wp-content/uploads/')) return url;
  const local = wpUrlToLocal(url);
  const dest = path.join(ROOT, 'public', local);
  try {
    await downloadFile(url, dest);
    return local;
  } catch {
    return local;
  }
}

async function processContent(html) {
  let out = html;
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href)="(https?:\/\/woonsprint\.nl\/wp-content\/uploads\/[^"]+)"/gi)) {
    urls.add(m[1]);
  }
  for (const url of urls) {
    const local = await localizeImage(url);
    out = out.split(url).join(local);
  }
  out = out.replace(/https?:\/\/woonsprint\.nl/gi, '');
  return out;
}

async function migratePost(post) {
  const slug = post.slug;
  const title = post.title.rendered.replace(/<[^>]+>/g, '');
  const description = stripTags(post.excerpt?.rendered || post.content.rendered).slice(0, 280);
  const pubDate = post.date.slice(0, 10);
  const updatedDate = post.modified.slice(0, 10);

  let featuredImage = '';
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (media?.source_url) {
    featuredImage = await localizeImage(media.source_url);
  } else {
    const imgMatch = post.content.rendered.match(
      /src="(https?:\/\/woonsprint\.nl\/wp-content\/uploads\/[^"]+)"/i,
    );
    if (imgMatch) {
      featuredImage = await localizeImage(imgMatch[1]);
    } else {
      featuredImage = '/wp-content/uploads/2022/11/Frame1.svg';
    }
  }

  const categories = post._embedded?.['wp:term']?.[0]?.map((t) => t.name) || [];
  const tags = post._embedded?.['wp:term']?.[1]?.map((t) => t.name) || [];
  const author = post._embedded?.author?.[0]?.name || '';

  const content = await processContent(post.content.rendered);

  const frontmatter = [
    '---',
    `title: ${escapeYaml(title)}`,
    `description: ${escapeYaml(description)}`,
    `pubDate: ${pubDate}`,
    `updatedDate: ${updatedDate}`,
    author ? `author: ${escapeYaml(author)}` : null,
    categories.length ? `categories:\n${categories.map((c) => `  - ${escapeYaml(c)}`).join('\n')}` : null,
    tags.length ? `tags:\n${tags.map((t) => `  - ${escapeYaml(t)}`).join('\n')}` : null,
    featuredImage ? `featuredImage: ${escapeYaml(featuredImage)}` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), `${frontmatter}\n\n${content}\n`, 'utf8');
  return slug;
}

async function main() {
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  let page = 1;
  let allPosts = [];

  while (true) {
    const posts = await fetchJson(`${LIVE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed`);
    if (!posts.length) break;
    allPosts = allPosts.concat(posts);
    if (posts.length < 100) break;
    page++;
  }

  console.log(`Migrating ${allPosts.length} blog posts...`);

  let ok = 0;
  let fail = 0;

  for (const post of allPosts) {
    if (post.slug.startsWith('hello-world')) continue;
    try {
      await migratePost(post);
      ok++;
      console.log(`  OK ${post.slug}`);
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      fail++;
      console.error(`  FAIL ${post.slug}: ${err.message}`);
    }
  }

  console.log(`Done: ${ok} ok, ${fail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
