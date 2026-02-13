# Narrative Radar (Solana)

A narrative detection + idea generation tool for the Solana ecosystem.

## Goal
- Detect **emerging narratives** and early signals in the Solana ecosystem (fortnightly)
- Explain *why* each narrative is trending (sources + signals)
- Generate **3–5 concrete build ideas** per narrative

## MVP scope (shipped)
- Data sources (free):
  - GitHub Search API (repo velocity: recent pushes + star-weighted scoring)
  - Curated RSS/blog sources (Solana Blog, Helius Blog, Superteam blog)
- Narrative detection:
  - Tag-based grouping + heuristic velocity scoring
  - Explainable output: each narrative includes evidence links + a short “why” section
- Ideas:
  - 3–5 concrete build ideas per narrative
- Hosted dashboard:
  - https://narrative-radar-solana.vercel.app

## How it works
- Generator script: `scripts/generate.ts`
- Output JSON: `web/public/data/latest.json`
- UI reads that JSON and renders:
  - narrative cards
  - why/evidence
  - build ideas

## Run locally
```bash
npm install
npm run radar:generate
cd web
npm install
npm run dev
```

## Notes / future improvements
- Better clustering (beyond tags)
- More data sources (onchain, more RSS feeds)
- Stronger ranking + dedupe + narrative naming
