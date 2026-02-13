import type { RadarItem } from './types.js';
import { GITHUB_QUERIES } from './sources.js';

type GithubRepo = {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string;
  topics?: string[];
};

function tagsFromRepo(r: GithubRepo): string[] {
  const tags = new Set<string>();
  const text = `${r.full_name} ${(r.description || '')}`.toLowerCase();
  const add = (t: string) => tags.add(t);
  if (text.includes('anchor')) add('anchor');
  if (text.includes('token-2022') || text.includes('token')) add('token');
  if (text.includes('agent') || text.includes('ai')) add('ai');
  if (text.includes('defi') || text.includes('swap') || text.includes('lending') || text.includes('perp')) add('defi');
  if (text.includes('nft')) add('nft');
  if (text.includes('mobile')) add('mobile');
  for (const t of r.topics || []) tags.add(t);
  return [...tags].slice(0, 8);
}

export async function fetchGithub(days = 14): Promise<RadarItem[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const items: RadarItem[] = [];

  for (const q of GITHUB_QUERIES) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q.q)}&sort=updated&order=desc&per_page=20`;
    const r = await fetch(url, { headers });
    if (!r.ok) continue;
    const data = await r.json();
    for (const repo of (data.items || []) as GithubRepo[]) {
      const pushedTs = Date.parse(repo.pushed_at);
      if (Number.isFinite(pushedTs) && pushedTs < cutoff) continue;

      const ageDays = Number.isFinite(pushedTs) ? Math.max(0, (Date.now() - pushedTs) / (24 * 60 * 60 * 1000)) : days;
      const score = 40 + Math.log10(1 + repo.stargazers_count) * 10 + Math.max(0, 14 - ageDays) * 2;

      items.push({
        id: `gh:${repo.full_name}`,
        kind: 'github_repo',
        sourceId: q.id,
        sourceLabel: `GitHub: ${q.label}`,
        title: repo.full_name,
        url: repo.html_url,
        publishedAt: repo.pushed_at,
        score,
        tags: tagsFromRepo(repo),
        summary: (repo.description || '').slice(0, 220) || undefined,
      });
    }
  }

  return items;
}
