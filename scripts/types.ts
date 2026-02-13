export type RadarItem = {
  id: string;
  kind: 'rss_post' | 'github_repo';
  sourceId: string;
  sourceLabel: string;
  title: string;
  url: string;
  publishedAt?: string;
  score: number;
  tags: string[];
  summary?: string;
};

export type Narrative = {
  id: string;
  title: string;
  score: number;
  why: string[]; // bullet points
  evidence: { title: string; url: string; sourceLabel: string }[];
  ideas: { title: string; description: string }[];
  tags: string[];
};

export type RadarOutput = {
  generatedAt: string;
  window: { days: number };
  sources: { id: string; label: string; url: string; kind: string }[];
  narratives: Narrative[];
  items: RadarItem[];
};
