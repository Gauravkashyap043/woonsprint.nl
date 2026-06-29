#!/usr/bin/env node
/**
 * Downloads brand assets from live woonsprint.nl
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LIVE = 'https://woonsprint.nl';

const assets = [
  '/wp-content/uploads/2022/11/Frame-182.svg',
  '/wp-content/uploads/2022/11/Frame-19.svg',
  '/wp-content/uploads/2022/11/Frame1.svg',
  '/wp-content/uploads/2022/11/Frame2.svg',
  '/wp-content/uploads/2022/11/Frame3.svg',
  '/wp-content/uploads/2022/11/Rectangle-366.jpg',
  '/wp-content/uploads/2022/11/cropped-Group-11-32x32.png',
  '/wp-content/uploads/2022/11/cropped-Group-11-192x192.png',
  '/wp-content/uploads/2022/11/LeagueSpartan-Regular.ttf',
  '/wp-content/uploads/2022/11/LeagueSpartan-Medium.ttf',
  '/wp-content/uploads/2022/11/LeagueSpartan-SemiBold.ttf',
  '/wp-content/uploads/2023/05/6f83ea46-04c7-4b6c-9e8a-89f1567cdadf-881x1024.jpeg',
  '/wp-content/uploads/2023/05/Schommelstoel-1024x1024.jpeg',
  '/wp-content/uploads/2023/05/d15937cc-c579-42e7-a14f-8ac2bf175efe-951x1024.jpeg',
  '/wp-content/uploads/2023/05/5278a73e-38e6-49b7-83d6-a62d969e4dc2-1024x788.jpeg',
  '/wp-content/uploads/2023/05/d-1024x1020.jpeg',
];

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

async function main() {
  for (const asset of assets) {
    const url = `${LIVE}${asset}`;
    const dest =
      asset.includes('LeagueSpartan') ?
        path.join(ROOT, 'public/fonts', path.basename(asset))
      : path.join(ROOT, 'public', asset);
    try {
      await downloadFile(url, dest);
      console.log(`OK ${asset}`);
    } catch (err) {
      console.error(`FAIL ${asset}: ${err.message}`);
    }
  }
}

main().catch(console.error);
