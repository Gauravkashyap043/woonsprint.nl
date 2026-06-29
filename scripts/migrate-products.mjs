#!/usr/bin/env node
/**
 * Migrates product (zb_mp) pages from live woonblogmagazine.nl into Astro content collection.
 * Usage: node scripts/migrate-products.mjs [--slug beste-invalzaag] [--limit N]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_DIR = path.join(ROOT, 'src/content/products');
const UPLOADS_DIR = path.join(ROOT, 'public/wp-content/uploads');
const AFFILIATE_DIR = path.join(ROOT, 'public/images/affiliate');
const LIVE = 'https://woonsprint.nl';

const args = process.argv.slice(2);
const slugArg = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
const limitArg = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : null;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 WoonblogMigration/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchText(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
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
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    proto
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
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

function escapeYaml(value) {
  if (value == null) return '""';
  const str = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${str}"`;
}

function wpUrlToLocal(url) {
  const match = url.match(/wp-content\/uploads\/(.+)$/i);
  if (!match) return url;
  return `/wp-content/uploads/${match[1]}`;
}

async function localizeAffiliateImage(url) {
  if (!url.includes('myfreeimagehost.com') && !url.includes('bol.com')) return url;
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const ext = path.extname(new URL(url).pathname) || '.jpg';
  const localPath = `/images/affiliate/${hash}${ext}`;
  const dest = path.join(ROOT, 'public', localPath);
  try {
    await downloadFile(url, dest);
    return localPath;
  } catch {
    return url;
  }
}

async function localizeWpImage(url) {
  if (!url.includes('wp-content/uploads/')) return url;
    const local = wpUrlToLocal(url.replace(/^https?:\/\/woonsprint\.nl/i, ''));
  const dest = path.join(ROOT, 'public', local);
  try {
    const fullUrl = url.startsWith('http') ? url : `${LIVE}${url}`;
    await downloadFile(fullUrl, dest);
    return local;
  } catch {
    return local;
  }
}

async function processImages(html) {
  let out = html;
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|data-lazy-src|href)="(https?:\/\/[^"]+)"/gi)) {
    urls.add(m[1]);
  }
  for (const m of html.matchAll(/(?:src|data-lazy-src)="(\/wp-content\/uploads\/[^"]+)"/gi)) {
    urls.add(`${LIVE}${m[1]}`);
  }

  for (const url of urls) {
    let local = url;
    if (url.includes('wp-content/uploads/')) {
      local = await localizeWpImage(url);
    } else if (url.includes('myfreeimagehost.com') || url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)) {
      if (url.includes('myfreeimagehost') || url.includes('images.')) {
        local = await localizeAffiliateImage(url);
      }
    }
    if (local !== url) {
      out = out.split(url).join(local);
    }
  }
  out = out.replace(/https?:\/\/woonsprint\.nl/gi, '');
  out = out.replace(/data-lazy-src=/gi, 'src=');
  return out;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSections(html) {
  const start = html.indexOf('data-elementor-type="wp-page"');
  const footer = html.indexOf('elementor-location-footer');
  if (start < 0 || footer < 0) return null;

  const chunk = html.slice(start, footer);
  const sections = [...chunk.matchAll(/<section class="elementor-section[^"]*"[^>]*>([\s\S]*?)<\/section>/gi)].map(
    (m) => m[0],
  );
  return sections;
}

function extractBreadcrumb(html) {
  const home = { label: 'Home', href: '/' };
  const catMatch = html.match(/Gereedschappen|Slaapkamer|Inrichting|Badkamer|Wasruimte|Veiligheid|Terras/);
  const catMap = {
    Gereedschappen: '/inrichting/',
    Inrichting: '/inrichting/',
    Slaapkamer: '/slaapkamer/',
    Badkamer: '/badkamer/',
    Wasruimte: '/badkamer/',
    Veiligheid: '/veiligheid/',
    Terras: '/inrichting/',
  };
  const cat = catMatch ? catMatch[0] : 'Inrichting';
  const slugLabel = html.match(/<h1[^>]*>Vergelijk de 10 beste ([^[]+)\[/i);
  const label = slugLabel ? slugLabel[1].trim().split(' ').pop() : 'product';
  return {
    parent: cat,
    parentHref: catMap[cat] || '/inrichting/',
    label: label.toLowerCase(),
    items: [home, { label: cat, href: catMap[cat] || '/' }, { label: label.toLowerCase(), href: '' }],
  };
}

function parseUpdatedDate(text) {
  const months = {
    jan: '01',
    feb: '02',
    mrt: '03',
    mar: '03',
    apr: '04',
    mei: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    okt: '10',
    nov: '11',
    dec: '12',
  };
  const m = text.match(/(\d{1,2})\s+(\w+)\.?\s+(\d{4})/i);
  if (!m) return new Date().toISOString().slice(0, 10);
  const mon = months[m[2].slice(0, 3).toLowerCase()] || '01';
  return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
}

async function migrateProduct(slug) {
  const url = `${LIVE}/${slug}/`;
  const html = await fetchText(url);
  const pageTitle = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || slug;
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || pageTitle;
  const updatedRaw = html.match(/Laatst bijgewerkt:\s*([^<]+)/)?.[1]?.trim() || '';
  const updatedDate = parseUpdatedDate(updatedRaw);
  const breadcrumb = extractBreadcrumb(html);
  const sections = extractSections(html);
  if (!sections || sections.length === 0) {
    throw new Error(`No elementor sections found for ${slug}`);
  }

  const heroSection = sections[0];
  const heroParas = [...heroSection.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
    .map((m) => m[0])
    .filter((p) => stripTags(p).length > 40);
  const heroCta = heroSection.match(/<a[^>]+class="[^"]*elementor-button[^"]*"[^>]*>[\s\S]*?<\/a>/i)?.[0] || '';
  let heroIntro = [...new Set([...heroParas, heroCta].filter(Boolean))].join('\n');

  let bodySections = sections.slice(1).join('\n');
  bodySections = await processImages(bodySections);
  heroIntro = await processImages(heroIntro);

  const description = stripTags(heroIntro).slice(0, 280) || pageTitle;

  const frontmatter = [
    '---',
    `title: ${escapeYaml(pageTitle)}`,
    `heading: ${escapeYaml(h1)}`,
    `description: ${escapeYaml(description)}`,
    `updatedDate: ${updatedDate}`,
    `breadcrumbParent: ${escapeYaml(breadcrumb.parent)}`,
    `breadcrumbParentHref: ${escapeYaml(breadcrumb.parentHref)}`,
    `breadcrumbLabel: ${escapeYaml(breadcrumb.label)}`,
    `updatedLabel: ${escapeYaml(updatedRaw)}`,
    '---',
  ].join('\n');

  const file = `${frontmatter}\n\n<div class="product-hero-intro">\n${heroIntro}\n</div>\n\n<div class="product-body">\n${bodySections}\n</div>\n`;
  fs.writeFileSync(path.join(PRODUCTS_DIR, `${slug}.md`), file, 'utf8');
  return slug;
}

async function getProductSlugs() {
  const sitemap = await fetchText(`${LIVE}/zb_mp-sitemap.xml`);
  return [...sitemap.matchAll(/<loc>https:\/\/woonsprint\.nl\/([^/<]+)\/<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  fs.mkdirSync(AFFILIATE_DIR, { recursive: true });

  let slugs = await getProductSlugs();
  if (slugArg) slugs = slugs.filter((s) => s === slugArg);
  if (limitArg) slugs = slugs.slice(0, limitArg);

  console.log(`Migrating ${slugs.length} product pages...`);
  let ok = 0;
  let fail = 0;

  for (const slug of slugs) {
    try {
      await migrateProduct(slug);
      ok++;
      if (ok % 10 === 0) console.log(`  ${ok}/${slugs.length}`);
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      fail++;
      console.error(`  FAIL ${slug}: ${err.message}`);
    }
  }

  console.log(`Done: ${ok} ok, ${fail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
