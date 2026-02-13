import fs from 'node:fs';
import path from 'node:path';

import { fetchRss } from './fetchRss.js';
import { fetchGithub } from './fetchGithub.js';
import { RSS_SOURCES } from './sources.js';
import type { Narrative, RadarItem, RadarOutput } from './types.js';

function getArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function primaryTag(it: RadarItem): string {
  // Pick a single tag per item to avoid the same evidence appearing in many narratives.
  const tags = it.tags.length ? it.tags : ['misc'];
  const priority = ['ai', 'token', 'defi', 'anchor', 'payments', 'mobile', 'depin', 'nft', 'misc'];
  for (const p of priority) if (tags.includes(p)) return p;
  return tags[0] || 'misc';
}

function groupByPrimaryTag(items: RadarItem[]): Map<string, RadarItem[]> {
  const m = new Map<string, RadarItem[]>();
  for (const it of items) {
    const t = primaryTag(it);
    const arr = m.get(t) || [];
    arr.push(it);
    m.set(t, arr);
  }
  for (const [t, arr] of m.entries()) arr.sort((a, b) => b.score - a.score);
  return m;
}

function narrativeTitle(tag: string) {
  const map: Record<string, string> = {
    ai: 'AI Agents x Solana Tooling',
    token: 'Token Extensions / Token-2022 Adoption',
    anchor: 'Anchor + Developer UX Iteration',
    defi: 'DeFi Iteration + New Market Structures',
    nft: 'NFT Utility + Consumer Experimentation',
    payments: 'Payments + Consumer Flows',
    mobile: 'Mobile-first Solana Apps',
    depin: 'DePIN + Real-world Integrations',
    misc: 'Other Emerging Signals',
  };
  return map[tag] || tag;
}

function ideasForTag(tag: string): Narrative['ideas'] {
  const ideas: Record<string, Narrative['ideas']> = {
    ai: [
      { title: 'Agent-safe action router', description: 'Policy-gated intent router for wallets + dApps, with receipts + spend caps.' },
      { title: 'On-chain narrative scout agent', description: 'Agent that tracks signals, generates weekly narrative briefs, and posts to a public hub.' },
      { title: 'Security-first agent sandbox', description: 'Simulate Solana tx outcomes + risk scoring before signing.' },
    ],
    token: [
      { title: 'Token Extensions directory', description: 'Live tracker of Token-2022 usage + best-practice templates.' },
      { title: 'Transfer hook commerce', description: 'Payments / loyalty primitives using transfer hooks + receipts.' },
      { title: 'Issuer compliance toolkit', description: 'Open-source rules engine to encode transfer restrictions and audit logs.' },
    ],
    anchor: [
      { title: 'Anchor template generator', description: 'Generate secure program templates with tests + CI + linting.' },
      { title: 'Program diff + upgrade advisor', description: 'Surface breaking changes and safe upgrade paths for Anchor programs.' },
      { title: 'IDL intelligence', description: 'Search + compare IDLs and usage examples across ecosystem.' },
    ],
    defi: [
      { title: 'Liquidity insight radar', description: 'Detect liquidity shifts + new primitives and generate strategy ideas.' },
      { title: 'Perp risk dashboard', description: 'Explain liquidation clusters + open interest changes with alerts.' },
      { title: 'Composable DeFi lego index', description: 'Map protocols + integrations to highlight gaps and build opportunities.' },
    ],
    payments: [
      { title: 'Merchant starter kit', description: 'Plug-and-play checkout with receipts + refunds + accounting exports.' },
      { title: 'Micropaywall for content', description: 'Solana Pay micro-tipping with simple UX.' },
      { title: 'Recurring payments primitive', description: 'Escrow + schedule pattern with transparent controls.' },
    ],
    mobile: [
      { title: 'Mobile wallet UX benchmark', description: 'Compare flows across wallets and propose improvements with metrics.' },
      { title: 'Offline-first Solana app starter', description: 'Sync model patterns + safe signing flows.' },
      { title: 'Push-notif transaction concierge', description: 'Explain transactions in human language with risk flags.' },
    ],
    misc: [
      { title: 'Narrative-to-ideas API', description: 'Public API that outputs narratives + citations + ranked ideas.' },
      { title: 'Ecosystem signal dashboard', description: 'One page: repos, onchain signals, blog coverage, ranked weekly.' },
      { title: 'Founder briefing generator', description: 'Generate investor-style briefs from evidence links.' },
    ],
  };
  return ideas[tag] || ideas.misc;
}

function buildNarratives(items: RadarItem[]): Narrative[] {
  const byTag = groupByPrimaryTag(items);

  const narratives: Narrative[] = [];
  for (const [tag, arr] of byTag.entries()) {
    const top = arr.slice(0, 6);
    const score = top.reduce((s, x) => s + x.score, 0);
    const evidence = top.slice(0, 5).map((x) => ({ title: x.title, url: x.url, sourceLabel: x.sourceLabel }));

    const why: string[] = [];
    if (top.some((x) => x.kind === 'github_repo')) why.push('Increased developer activity (recent pushes + star-weighted scoring).');
    if (top.some((x) => x.kind === 'rss_post')) why.push('Recent ecosystem write-ups / announcements in the last 14 days.');
    why.push('Ranked by a heuristic velocity score (recency + lightweight popularity).');

    narratives.push({
      id: `narrative:${tag}`,
      title: narrativeTitle(tag),
      score,
      why,
      evidence,
      ideas: ideasForTag(tag).slice(0, 5),
      tags: [tag],
    });
  }

  narratives.sort((a, b) => b.score - a.score);
  return narratives.slice(0, 10);
}

async function main() {
  const outPath = getArg('--out') || 'web/public/data/latest.json';
  const days = Number(getArg('--days') || '14');

  const [rss, gh] = await Promise.all([fetchRss(days), fetchGithub(days)]);
  const items = [...rss, ...gh].sort((a, b) => b.score - a.score);

  const output: RadarOutput = {
    generatedAt: new Date().toISOString(),
    window: { days },
    sources: [...RSS_SOURCES].map((s) => ({ id: s.id, label: s.label, url: s.url, kind: s.kind })),
    narratives: buildNarratives(items),
    items: items.slice(0, 200),
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath}`);
  // Ensure clean exit in CI/tool runners.
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
