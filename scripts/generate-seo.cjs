
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://braint.ru').replace(/\/$/, '');

const articlesDir = path.join(process.cwd(), 'public', 'articles');
const outDirs = [
  path.join(process.cwd(), 'dist'), 
  path.join(process.cwd(), 'public'), 
];

function toIsoDateOnly(date) {
  const d = new Date(date);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

async function readArticles() {
  try {
    const files = await fsp.readdir(articlesDir);
    const slugs = files.filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''));
    const items = await Promise.all(slugs.map(async (slug) => {
      try {
        const stat = await fsp.stat(path.join(articlesDir, `${slug}.mdx`));
        return { slug, lastmod: toIsoDateOnly(stat.mtime) };
      } catch (_) {
        return { slug, lastmod: undefined };
      }
    }));
    return items;
  } catch (err) {
    console.warn(`[sitemap] Cannot read articles directory: ${err.message}`);
    return [];
  }
}

function buildSitemapXml(pages) {
  const urls = pages.map(p => {
    const parts = [
      `  <url>`,
      `    <loc>${SITE_URL}${p.path}</loc>`,
      p.lastmod ? `    <lastmod>${p.lastmod}</lastmod>` : null,
      `    <changefreq>${p.changefreq}</changefreq>`,
      `    <priority>${p.priority.toFixed(1)}</priority>`,
      `  </url>`
    ].filter(Boolean).join('\n');
    return parts;
  }).join('\n');

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    urls,
    `</urlset>`
  ].join('\n');
}

function buildRobotsTxt() {
  return [
    `User-agent: *`,
    `Allow: /`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ''
  ].join('\n');
}

async function ensureDir(dir) {
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch (_) {}
}

async function writeOutputs(sitemapXml, robotsTxt) {
  for (const dir of outDirs) {
    try {
      await ensureDir(dir);
      await fsp.writeFile(path.join(dir, 'sitemap.xml'), sitemapXml, 'utf8');
      await fsp.writeFile(path.join(dir, 'robots.txt'), robotsTxt, 'utf8');
      console.log(`[seo] Wrote sitemap.xml and robots.txt to ${dir}`);
    } catch (err) {
      console.warn(`[seo] Failed to write outputs in ${dir}: ${err.message}`);
    }
  }
}

async function main() {
  const articles = await readArticles();

  const today = toIsoDateOnly(new Date());
  const pages = [
    { path: '/', changefreq: 'daily', priority: 1.0, lastmod: today },
    { path: '/guide', changefreq: 'weekly', priority: 0.8, lastmod: today },
    ...articles.map(a => ({
      path: `/guide/${a.slug}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: a.lastmod || today,
    }))
  ];

  const sitemapXml = buildSitemapXml(pages);
  const robotsTxt = buildRobotsTxt();
  await writeOutputs(sitemapXml, robotsTxt);
}

main().catch(err => {
  console.error('[seo] Unexpected error:', err);
  process.exit(1);
});


