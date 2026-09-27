#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'public';
const site = 'https://ilham.dev';
let failures = 0;

function ok(message) { console.log(`✓ ${message}`); }
function fail(message) { failures += 1; console.error(`✗ ${message}`); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function json(rel) { return JSON.parse(read(rel)); }
function walk(dir, suffix, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, suffix, out);
    else if (entry.isFile() && full.endsWith(suffix)) out.push(full);
  }
  return out;
}
function urlToRel(url) {
  if (!url.startsWith(site + '/')) return null;
  let pathname = new URL(url).pathname;
  if (pathname.endsWith('/')) pathname += 'index.html';
  if (!path.extname(pathname)) pathname = pathname.replace(/\/?$/, '/index.html');
  return pathname.replace(/^\//, '');
}
function markdownUrlToRel(url) {
  if (!url?.startsWith(site + '/')) return null;
  return new URL(url).pathname.replace(/^\//, '');
}
function assetPathToRel(value) {
  if (!value || value.startsWith('#')) return null;
  if (/^(mailto:|tel:|javascript:|data:|blob:|ws:|wss:)/i.test(value)) return null;
  if (/^https?:\/\//i.test(value)) {
    if (!value.startsWith(site + '/')) return null;
    value = new URL(value).pathname;
  }
  if (!value.startsWith('/')) return null;
  let pathname = value.split('#')[0].split('?')[0];
  if (!pathname || pathname === '/') pathname = '/index.html';
  else if (pathname.endsWith('/')) pathname += 'index.html';
  else if (!path.extname(pathname)) pathname = pathname.replace(/\/?$/, '/index.html');
  return pathname.replace(/^\//, '');
}
function htmlHasMarkdownAlternate(html, mdPath) {
  return /rel=("alternate"|alternate)/.test(html) && /type=("text\/markdown"|text\/markdown)/.test(html) && html.includes(mdPath);
}

for (const rel of ['llms.txt', 'llms-full.txt', 'tools/llms.txt', 'tools/llms-full.txt', 'posts/llms.txt', 'posts/llms-full.txt', 'ai.txt']) {
  exists(rel) ? ok(`${rel} found`) : fail(`${rel} missing`);
}

if (exists('llms.txt')) {
  const lines = read('llms.txt').trim().split(/\r?\n/).length;
  lines <= 100 ? ok(`llms.txt is concise (${lines} lines)`) : fail(`llms.txt is too large (${lines} lines)`);
}

let toolsDoc;
try {
  toolsDoc = json('tools/tools.json');
  ok('tools/tools.json valid JSON');
  toolsDoc.schema_version ? ok(`tools.json schema_version ${toolsDoc.schema_version}`) : fail('tools.json missing schema_version');
} catch (error) {
  fail(`tools/tools.json invalid: ${error.message}`);
}

let searchIndex;
try {
  searchIndex = json('tools/search-index.json');
  ok('tools/search-index.json valid JSON');
} catch (error) {
  fail(`tools/search-index.json invalid: ${error.message}`);
}

let postsDoc;
try {
  postsDoc = json('posts/posts.json');
  ok('posts/posts.json valid JSON');
  postsDoc.schema_version ? ok(`posts.json schema_version ${postsDoc.schema_version}`) : fail('posts.json missing schema_version');
} catch (error) {
  fail(`posts/posts.json invalid: ${error.message}`);
}

if (toolsDoc && Array.isArray(toolsDoc.tools)) {
  const seen = new Set();
  const indexById = new Map(Array.isArray(searchIndex) ? searchIndex.map((item) => [item.id, item]) : []);

  for (const tool of toolsDoc.tools) {
    if (!tool.id) fail('tool without id');
    if (seen.has(tool.id)) fail(`duplicate tool id: ${tool.id}`);
    seen.add(tool.id);

    const canonical = tool.canonical_url || tool.url;
    if (!canonical || !canonical.startsWith(`${site}/tools/${tool.id}/`)) fail(`invalid canonical URL for ${tool.id}: ${canonical}`);

    const htmlRel = urlToRel(canonical || '');
    if (!htmlRel || !exists(htmlRel)) fail(`HTML page missing for ${tool.id}: ${canonical}`);

    const md = tool.markdown_url || tool.documentation;
    const mdRel = markdownUrlToRel(md || '');
    if (!mdRel || !exists(mdRel)) fail(`Markdown page missing for ${tool.id}: ${md}`);

    if (htmlRel && exists(htmlRel) && md) {
      const html = read(htmlRel);
      const mdPath = new URL(md).pathname;
      if (!htmlHasMarkdownAlternate(html, mdPath)) fail(`Markdown alternate link missing for ${tool.id}`);
      if (!/rel=("canonical"|canonical)/.test(html) || !html.includes(canonical)) fail(`canonical link missing/mismatched for ${tool.id}`);
      if (!/rel=("describedby"|describedby)/.test(html) || !html.includes('/llms.txt')) fail(`describedby llms.txt link missing for ${tool.id}`);
      if (!html.includes('application/ld+json')) fail(`JSON-LD missing for ${tool.id}`);
    }

    const indexed = indexById.get(tool.id);
    if (!indexed) fail(`search-index missing ${tool.id}`);
    else {
      if (indexed.url !== tool.url) fail(`search-index URL mismatch for ${tool.id}`);
      if (indexed.markdown_url !== md) fail(`search-index Markdown URL mismatch for ${tool.id}`);
      if (!Array.isArray(indexed.keywords) || indexed.keywords.length === 0) fail(`search-index keywords missing for ${tool.id}`);
    }

    for (const field of ['canonical_url', 'markdown_url', 'privacy', 'features', 'keywords']) {
      if (tool[field] === undefined || tool[field] === null) fail(`tool ${tool.id} missing ${field}`);
    }
  }
  ok(`${seen.size} unique tool IDs`);
}

if (postsDoc && Array.isArray(postsDoc.posts)) {
  let checked = 0;
  for (const post of postsDoc.posts) {
    const htmlRel = urlToRel(post.url);
    const mdRel = markdownUrlToRel(post.markdown);
    if (!htmlRel || !exists(htmlRel)) fail(`post HTML missing: ${post.url}`);
    if (!mdRel || !exists(mdRel)) fail(`post Markdown missing: ${post.markdown}`);
    if (htmlRel && exists(htmlRel) && post.markdown) {
      const html = read(htmlRel);
      const mdPath = new URL(post.markdown).pathname;
      if (!htmlHasMarkdownAlternate(html, mdPath)) fail(`post Markdown alternate link missing: ${post.id}`);
      if (!/rel=("describedby"|describedby)/.test(html) || !html.includes('/llms.txt')) fail(`post describedby llms.txt link missing: ${post.id}`);
      checked += 1;
    }
  }
  ok(`${checked} post HTML pages advertise Markdown twins`);
}

if (exists('robots.txt')) {
  const robots = read('robots.txt');
  if (/Disallow:\s*\/(tools|posts|llms\.txt|.*\.json|.*\.md)/i.test(robots)) fail('robots.txt blocks public AI resources');
  else ok('robots.txt does not block tools, posts, JSON, Markdown, or llms.txt');
} else fail('robots.txt missing');

exists('sitemap.xml') ? ok('sitemap.xml found') : fail('sitemap.xml missing');
if (exists('sitemap.xml')) {
  const sitemap = read('sitemap.xml');
  sitemap.includes(`${site}/tools/`) && sitemap.includes(`${site}/posts/`) ? ok('sitemap includes tools and posts') : fail('sitemap missing tools or posts URLs');
}

const broken = [];
for (const file of walk(root, '.html')) {
  const html = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(root, file);
  const matches = html.matchAll(/(?:href|src)=(["']?)([^"'\s>]+)\1/gi);
  for (const match of matches) {
    const rel = assetPathToRel(match[2]);
    if (rel && !exists(rel)) broken.push(`${relFile} -> ${match[2]}`);
  }
}
if (broken.length) {
  for (const item of broken.slice(0, 25)) fail(`broken internal URL: ${item}`);
  if (broken.length > 25) fail(`${broken.length - 25} more broken internal URLs`);
} else ok('No broken internal href/src URLs');

if (failures) {
  console.error(`\n${failures} AI compatibility check(s) failed.`);
  process.exit(1);
}
console.log('\nAI compatibility checks passed.');
