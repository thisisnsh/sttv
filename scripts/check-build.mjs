import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const output = path.resolve(process.env.OUTPUT_DIR || '_site');
const pathPrefix = `/${(process.env.PATH_PREFIX || '').split('/').filter(Boolean).join('/')}`.replace(/\/$/, '') || '';
async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(filename));
    else result.push(filename);
  }
  return result;
}
const files = await walk(output);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const titles = new Set();
let internalLinks = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relative = path.relative(output, file);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${relative}: expected one h1`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert(title && !titles.has(title), `${relative}: missing or duplicate title`);
  titles.add(title);
  assert(/<meta name="description" content="[^"]+"/.test(html), `${relative}: missing description`);
  assert(/<link rel="canonical" href="https?:\/\//.test(html), `${relative}: missing absolute canonical`);
  const structured = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert(structured && JSON.parse(structured)['@context'] === 'https://schema.org', `${relative}: invalid structured data`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${relative}: duplicate element IDs`);
  for (const match of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const url = match[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    const [urlPath, fragment] = url.split('#');
    if (!urlPath) { assert(!fragment || ids.includes(fragment), `${relative}: missing anchor ${fragment}`); continue; }
    assert(urlPath.startsWith(`${pathPrefix}/`), `${relative}: link misses prefix: ${urlPath}`);
    let target = path.join(output, decodeURIComponent(urlPath.slice(pathPrefix.length)).split('?')[0]);
    try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); await stat(target); }
    catch { throw new Error(`${relative}: broken local link ${url}`); }
    if (fragment && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      assert(targetHtml.includes(`id="${fragment}"`), `${relative}: missing target anchor ${url}`);
    }
    internalLinks++;
  }
}
const projects = JSON.parse(await readFile('src/_data/projects.json', 'utf8'));
assert.equal(htmlFiles.length, projects.length + 7, 'Expected seven core pages plus all project pages');
const manifest = JSON.parse(await readFile(path.join(output, 'site.webmanifest'), 'utf8'));
assert(manifest.icons.length >= 2, 'Missing app icons');
const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
assert(sitemap.trimStart().startsWith('<?xml'), 'Sitemap must be XML');
assert(!sitemap.includes('/work/the-next-chapter/'), 'Concept projects must stay out of the sitemap');
assert(files.some((file) => file.endsWith('.nojekyll')), 'GitHub Pages .nojekyll is missing');
console.log(`Verified ${htmlFiles.length} pages, ${internalLinks} internal links, structured data, sitemap and favicon manifest. Prefix: ${pathPrefix || '/'}`);
