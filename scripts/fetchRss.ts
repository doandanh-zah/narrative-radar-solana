import Parser from 'rss-parser';
import { RSS_SOURCES } from './sources.js';
import type { RadarItem } from './types.js';

const parser = new Parser();

function tagsFromText(text: string): string[] {
  const t = text.toLowerCase();
  const tags = new Set<string>();
  const add = (k: string) => tags.add(k);
  if (t.includes('token') || t.includes('token-2022')) add('token');
  if (t.includes('anchor')) add('anchor');
  if (t.includes('ai') || t.includes('agent')) add('ai');
  if (t.includes('depin')) add('depin');
  if (t.includes('defi') || t.includes('swap') || t.includes('lending') || t.includes('perp')) add('defi');
  if (t.includes('nft')) add('nft');
  if (t.includes('mobile')) add('mobile');
  if (t.includes('payments') || t.includes('pay')) add('payments');
  return [...tags];
}

export async function fetchRss(days = 14): Promise<RadarItem[]> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const out: RadarItem[] = [];

  for (const s of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(s.url);
      for (const it of feed.items || []) {
        const title = it.title || '';
        const url = (it.link || '') as string;
        const publishedAt = (it.isoDate || it.pubDate || '') as string;
        const ts = publishedAt ? Date.parse(publishedAt) : NaN;
        if (Number.isFinite(ts) && ts < cutoff) continue;
        if (!title || !url) continue;

        const summary = (it.contentSnippet || it.content || '') as string;
        const ageDays = Number.isFinite(ts) ? Math.max(0, (Date.now() - ts) / (24 * 60 * 60 * 1000)) : days;
        const score = 30 + Math.max(0, 14 - ageDays) * 2;

        out.push({
          id: `rss:${s.id}:${url}`,
          kind: 'rss_post',
          sourceId: s.id,
          sourceLabel: s.label,
          title,
          url,
          publishedAt: publishedAt || undefined,
          score,
          tags: tagsFromText(`${title} ${summary}`),
          summary: summary?.slice(0, 280) || undefined,
        });
      }
    } catch {
      // ignore source failures in MVP
    }
  }

  return out;
}
