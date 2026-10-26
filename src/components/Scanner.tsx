import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Concern, SkinScore } from "../../shared/types";
import { CONCERN_LABEL } from "../../shared/catalog";
import { depthOf, undertoneOf } from "../../shared/color";
import { band, bandColour } from "../lib/format";
import type { Shea } from "../lib/useShea";
import { photoSet } from "./Photo";

// Where each concern reads on a front-facing, face-filling portrait (percent of the frame).
const SPOTS: Partial<Record<Concern, [number, number]>> = {
  texture: [38, 27], dark_circle_v2: [20, 52], age_spot: [64, 63], pore: [30, 58], oiliness: [36, 41], acne: [44, 84], moisture: [12, 67],
};
const PHASE_TEXT: Record<string, string> = {
  idle: "Ready", preparing: "Preparing photo", uploading: "Sending to YouCam", reading: "Reading 8 skin concerns + skin colour",
  planning: "Agent is weighing results", done: "Scan complete", error: "Scan stopped",
};

export function Scanner({ shea }: { shea: Shea }) {
  const { phase, subject, skin, tone, resultMode } = shea;
  const reduce = useReducedMotion();
  const [mask, setMask] = useState<string>();
  const scanning = phase === "preparing" || phase === "uploading" || phase === "reading";
  const scores = skin ? [...skin.scores].sort((a, b) => a.score - b.score) : [];
  const sample = subject.kind === "sample";
  const set = sample ? photoSet("face-scan") : { src: subject.src, srcSet: undefined };

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] sm:gap-5" data-testid="scanner">
      <figure className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-ink shadow-[0_30px_60px_-30px_rgba(29,20,15,.55)]">
        <img {...set} sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 92vw" alt={sample ? "Sample portrait used for the demo scan" : "Your photo"}
          fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
        {(mask || skin?.overlayUrl) && resultMode === "live" && (
          <img src={mask ?? skin!.overlayUrl} alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-80" />
        )}
        {/* scan beam */}
        <AnimatePresence>
          {scanning && !reduce && (
            <motion.div key="beam" className="pointer-events-none absolute inset-x-0 h-24" initial={{ top: "-15%", opacity: 0 }}
              animate={{ top: ["-15%", "100%"], opacity: 1 }} exit={{ opacity: 0 }} transition={{ top: { duration: 1.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }, opacity: { duration: 0.3 } }}
              style={{ background: "linear-gradient(to bottom, transparent, rgba(226,165,74,.28) 70%, rgba(244,236,223,.9) 98%, transparent)" }} />
          )}
        </AnimatePresence>
        {scanning && <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(244,236,223,.55)_1px,transparent_1.2px)] [background-size:14px_14px]" />}
        {/* region markers */}
        {skin && sample && scores.slice(0, 4).map((s, i) => {
          const at = SPOTS[s.concern]; if (!at) return null;
          return (
            <motion.div key={s.concern} className="absolute" style={{ left: `${at[0]}%`, top: `${at[1]}%` }}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 260, damping: 20 }}>
              <span className="absolute -left-2 -top-2 block h-4 w-4 rounded-full border-2 border-paper bg-[color:var(--c)]" style={{ "--c": bandColour[band(s.score)] } as React.CSSProperties} />
              <span className={`absolute top-3 whitespace-nowrap rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-paper backdrop-blur ${at[0] > 55 ? "right-0" : "left-0"}`}>
                {CONCERN_LABEL[s.concern]} <b className="tnum">{s.score}</b>
              </span>
            </motion.div>
          );
        })}
        <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-full bg-ink/75 py-1.5 pl-3 pr-1.5 text-xs text-paper backdrop-blur" aria-live="polite">
          <span className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${phase === "error" ? "bg-clay" : phase === "done" ? "bg-[#8fbf8a]" : "animate-pulse bg-ochre-2"}`} />
            <span data-testid="phase">{PHASE_TEXT[phase]}</span>
          </span>
          {tone && (
            <span className="flex items-center gap-1.5 rounded-full bg-paper/12 py-0.5 pl-0.5 pr-2.5">
              <span className="h-5 w-5 rounded-full ring-1 ring-paper/40" style={{ background: tone.skin }} />
              <span className="tnum uppercase">{tone.skin}</span>
            </span>
          )}
        </figcaption>
      </figure>

      <div className="flex flex-col">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">YouCam skin scores</p>
          <p className="caption">0–100, higher is healthier</p>
        </div>
        <ol className="mt-3 flex-1 space-y-[0.55rem]" data-testid="scores">
          {(skin ? scores : PLACEHOLDER).map((s, i) => (
            <li key={s.concern}>
              <button type="button" disabled={!s.maskUrl || resultMode !== "live"} onClick={() => setMask(mask === s.maskUrl ? undefined : s.maskUrl)}
                className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-3 text-left disabled:cursor-default">
                <span className="truncate text-[0.86rem] text-ink-2">{CONCERN_LABEL[s.concern]}</span>
                <span className="tnum text-[0.86rem] font-semibold">{skin ? s.score : "··"}</span>
                <span className="col-span-2 mt-1 block h-[5px] overflow-hidden rounded-full bg-ink/8">
                  {skin && (
                    <motion.span className="block h-full rounded-full" style={{ background: bandColour[band(s.score)] }}
                      initial={reduce ? false : { width: 0 }} animate={{ width: `${s.score}%` }} transition={{ delay: 0.1 + i * 0.06, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
                  )}
                  {!skin && scanning && !reduce && <span className="block h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-ink/15" />}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-2xl bg-paper-2/80 p-3.5">
          <p className="eyebrow">Skin colour</p>
          {tone ? (
            <p className="mt-1 text-sm text-ink-2"><span className="display text-xl text-ink">{cap(depthOf(tone.skin))}</span>, {undertoneOf(tone.skin)} undertone</p>
          ) : <p className="mt-1 text-sm text-ink-3">Measured by YouCam Facial Color Tones</p>}
        </div>
        {resultMode === "demo" && skin && (
          <p className="mt-3 text-[0.74rem] leading-snug text-clay" data-testid="demo-label">Demo: sample results, not a reading of this person. Live scans run once a YouCam key is set.</p>
        )}
      </div>
    </div>
  );
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const PLACEHOLDER: SkinScore[] = (["age_spot", "dark_circle_v2", "oiliness", "acne", "texture", "pore", "moisture", "radiance"] as Concern[]).map((c) => ({ concern: c, score: 0 }));
