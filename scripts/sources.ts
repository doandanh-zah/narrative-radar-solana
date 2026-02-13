export type Source = {
  id: string;
  label: string;
  url: string;
  kind: 'rss' | 'github';
};

export const RSS_SOURCES: Source[] = [
  {
    id: 'solana-blog',
    label: 'Solana Blog',
    url: 'https://solana.com/rss',
    kind: 'rss',
  },
  {
    id: 'helius-blog',
    label: 'Helius Blog',
    url: 'https://www.helius.dev/blog/rss.xml',
    kind: 'rss',
  },
  {
    id: 'superteam',
    label: 'Superteam',
    url: 'https://superteam.fun/blog/rss.xml',
    kind: 'rss',
  },
];

export const GITHUB_QUERIES: { id: string; label: string; q: string }[] = [
  {
    id: 'anchor',
    label: 'Anchor framework',
    q: 'anchor lang:TypeScript OR lang:Rust topic:solana pushed:>2026-01-20',
  },
  {
    id: 'token-extensions',
    label: 'Token-2022 / Token Extensions',
    q: 'token-2022 OR "token extensions" topic:solana pushed:>2026-01-20',
  },
  {
    id: 'solana-defi',
    label: 'DeFi on Solana',
    q: 'topic:solana (defi OR swap OR lending OR perp) pushed:>2026-01-20',
  },
  {
    id: 'solana-ai',
    label: 'AI x Solana',
    q: 'topic:solana (agent OR ai OR "tool calling" OR mcp) pushed:>2026-01-20',
  },
];
