import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Shea } from "../lib/useShea";
import { SAMPLE } from "../lib/useShea";
import { Scanner } from "./Scanner";
import { Credit } from "./Photo";

const WORDS = ["A", "skin", "scan", "that", "knows", "deep", "skin."];

export function Hero({ shea }: { shea: Shea }) {
  const reduce = useReducedMotion();
  const started = useRef(false);
  useEffect(() => { // run the sample once the API mode is known, so the product is working on first paint
    if (shea.mode !== "unknown" && !started.current) { started.current = true; const t = setTimeout(() => shea.start(SAMPLE), 350); return () => clearTimeout(t); }
  }, [shea.mode, shea.start]);
  const busy = !["idle", "done", "error"].includes(shea.phase);

  return (
    <section id="scan" className="relative mx-auto max-w-[1320px] px-5 pb-16 pt-20 sm:px-8 sm:pt-24 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-16 lg:pt-24">
      <div className="grid w-full items-start gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 lg:pt-10">
          <p className="eyebrow">YouCam Skin AI · built for Accra</p>
          <h1 className="display mt-3 text-[2.55rem] leading-[0.98] font-[450] sm:text-6xl lg:text-[4.6rem]" aria-label="A skin scan that knows deep skin.">
            {WORDS.map((w, i) => (
              <motion.span key={i} aria-hidden className={`inline-block pr-[0.22em] ${w.startsWith("deep") ? "display-wonk text-ochre" : ""}`}
                initial={reduce ? false : { y: "0.5em", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
            ))}
          </h1>
          <p className="mt-5 hidden max-w-md text-[1.05rem] leading-relaxed text-ink-2 lg:block">
            Shea reads a selfie with YouCam's skin AI, re-weights the results for melanin-rich skin, refuses bleaching creams,
            and picks clothes by measuring their contrast against your actual skin colour.
          </p>
          <Actions shea={shea} busy={busy} className="mt-8 hidden lg:flex" />
        </div>
        <div className="lg:col-span-7">
          <Scanner shea={shea} />
          <Actions shea={shea} busy={busy} className="mt-5 flex lg:hidden" />
          <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-ink-2 lg:hidden">
            Shea re-weights YouCam's results for melanin-rich skin, refuses bleaching creams, and picks clothes by contrast against your actual skin colour.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="caption">Not medical advice. Your photo goes only to YouCam and is not stored by Shea.</p>
            {shea.subject.kind === "sample" && <Credit name="face" />}
          </div>
          {(shea.notice || shea.error) && (
            <p role="status" className="mt-3 rounded-xl border border-clay/30 bg-clay/8 px-4 py-3 text-sm text-clay">{shea.error ?? shea.notice}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Actions({ shea, busy, className }: { shea: Shea; busy: boolean; className: string }) {
  return (
    <div className={`flex-wrap items-center gap-3 ${className}`}>
      <label className={`btn btn-primary cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
        Scan my selfie
        <input type="file" accept="image/jpeg,image/png" capture="user" className="sr-only" disabled={busy}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) shea.useFile(f); e.target.value = ""; }} />
      </label>
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => shea.start(SAMPLE)}>Re-run sample</button>
      <a href="#plan" className="px-2 text-sm font-medium text-ink-2 underline underline-offset-4 hover:text-ink">See the plan ↓</a>
    </div>
  );
}
