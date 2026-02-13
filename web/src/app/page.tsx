'use client';

import { useEffect, useMemo, useState } from 'react';

type RadarOutput = {
  generatedAt: string;
  window: { days: number };
  sources: { id: string; label: string; url: string; kind: string }[];
  narratives: {
    id: string;
    title: string;
    score: number;
    why: string[];
    evidence: { title: string; url: string; sourceLabel: string }[];
    ideas: { title: string; description: string }[];
    tags: string[];
  }[];
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90 backdrop-blur">
      {children}
    </span>
  );
}

export default function Home() {
  const [data, setData] = useState<RadarOutput | null>(null);

  useEffect(() => {
    fetch('/data/latest.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const top = useMemo(() => (data?.narratives || []).slice(0, 8), [data]);

  return (
    <main className="min-h-screen bg-[#07070B] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-20 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:26px_26px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-10">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Narrative Radar</h1>
              <p className="text-white/60 mt-1">Solana signals → narratives → 3–5 build ideas (fortnightly)</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Pill>Explainable</Pill>
              <Pill>Quality &gt; volume</Pill>
              <Pill>Fast MVP</Pill>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-white/60">
            {data ? (
              <>
                <Pill>Window: {data.window.days} days</Pill>
                <Pill>Generated: {new Date(data.generatedAt).toUTCString()}</Pill>
                <a
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90 hover:bg-white/10"
                  href="https://github.com/doandanh-zah/narrative-radar-solana"
                  target="_blank"
                  rel="noreferrer"
                >
                  Repo
                </a>
              </>
            ) : (
              <Pill>Loading latest.json…</Pill>
            )}
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {top.map((n) => (
            <div
              key={n.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-white/50">Narrative</div>
                  <h2 className="text-xl font-extrabold mt-1">{n.title}</h2>
                </div>
                <Pill>score {Math.round(n.score)}</Pill>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(n.tags || []).slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-black/30 px-3 py-1 text-xs text-white/70 border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <div className="text-sm font-bold">Why this is trending</div>
                <ul className="mt-2 space-y-1 text-sm text-white/70 list-disc pl-5">
                  {n.why.slice(0, 3).map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <div className="text-sm font-bold">Evidence</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {n.evidence.slice(0, 3).map((e) => (
                    <li key={e.url} className="text-white/70">
                      <a className="hover:underline text-[#FFD700]" href={e.url} target="_blank" rel="noreferrer">
                        {e.title}
                      </a>
                      <span className="text-white/40"> — {e.sourceLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <div className="text-sm font-bold">Build ideas</div>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {n.ideas.slice(0, 5).map((i) => (
                    <div key={i.title} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="font-bold">{i.title}</div>
                      <div className="text-sm text-white/70 mt-1">{i.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-10 text-xs text-white/40">
          MVP: scoring is heuristic (recency + lightweight popularity). Next steps: better clustering, more RSS coverage, and clearer ranking details.
        </footer>
      </div>
    </main>
  );
}
