import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Plan, TraceStep } from "../../shared/types";
import { ghs, STEP_LABEL } from "../lib/format";
import { Reveal } from "./Reveal";

const KIND: Record<TraceStep["kind"], { label: string; colour: string }> = {
  observe: { label: "Observe", colour: "var(--color-ink-3)" }, reason: { label: "Reason", colour: "var(--color-ochre)" },
  guard: { label: "Guard", colour: "var(--color-clay)" }, act: { label: "Act", colour: "var(--color-leaf)" },
};

export function PlanSection({ plan, busy }: { plan?: Plan; busy: boolean }) {
  const [when, setWhen] = useState<"am" | "pm">("am");
  const reduce = useReducedMotion();
  const routine = plan ? plan[when] : [];
  return (
    <section id="plan" className="border-t rule bg-paper-2/45">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">02 · The agent</p>
            <h2 className="display mt-3 text-4xl leading-[1.02] sm:text-5xl">The plan, <span className="display-wonk">and why.</span></h2>
          </div>
          <p className="max-w-xl self-end text-[1.02rem] leading-relaxed text-ink-2 lg:col-span-6 lg:col-start-7">
            Generic apps rank acne first. On deep skin, the dark marks a breakout leaves (PIH) last for months, so Shea weighs them higher, adjusts for Accra's heat and UV, and checks every product against what Ghana's FDA bans.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* trace */}
          <ol className="relative lg:col-span-5" data-testid="trace" aria-busy={busy}>
            <span className="absolute bottom-3 left-[7px] top-3 w-px bg-ink/15" aria-hidden />
            {(plan?.trace ?? []).map((t, i) => (
              <motion.li key={t.id} className="relative pb-6 pl-8" initial={reduce ? false : { opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}>
                <span className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] border-paper" style={{ background: KIND[t.kind].colour }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: KIND[t.kind].colour }}>{KIND[t.kind].label}</p>
                <p className="mt-0.5 font-semibold">{t.title}</p>
                <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-2">{t.detail}</p>
              </motion.li>
            ))}
            {!plan && <li className="pl-8 text-ink-3">{busy ? "Waiting for the scan…" : "Run a scan to see the agent's reasoning."}</li>}
          </ol>

          <div className="space-y-6 lg:col-span-7">
            {/* routine */}
            <div className="rounded-[1.6rem] bg-paper p-5 shadow-[0_1px_0_rgba(29,20,15,.08)] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="display text-2xl">Routine</h3>
                <div role="tablist" aria-label="Time of day" className="flex rounded-full bg-paper-2 p-1 text-sm">
                  {(["am", "pm"] as const).map((w) => (
                    <button key={w} role="tab" aria-selected={when === w} onClick={() => setWhen(w)}
                      className={`rounded-full px-4 py-1.5 font-medium transition-colors ${when === w ? "bg-ink text-paper" : "text-ink-2"}`}>{w === "am" ? "Morning" : "Evening"}</button>
                  ))}
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.ol key={when} className="mt-5 divide-y divide-ink/10" data-testid="routine"
                  initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {routine.map((p, i) => (
                    <li key={p.product.id} className="grid grid-cols-[2.2rem_1fr_auto] gap-x-3 py-3.5">
                      <span className="display tnum text-lg text-ink-3">{i + 1}</span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">{STEP_LABEL[p.product.step]}</p>
                        <p className="font-semibold">{p.product.name}</p>
                        <p className="mt-0.5 text-[0.86rem] text-ink-2">{p.reason}</p>
                        <p className="mt-1 text-[0.78rem] text-ink-3">{p.product.ingredients.join(" · ")}</p>
                      </div>
                      <span className="tnum whitespace-nowrap text-sm text-ink-2">{ghs(p.product.priceGhs)}</span>
                    </li>
                  ))}
                  {!plan && [0, 1, 2, 3].map((i) => <li key={i} className="h-16 animate-pulse py-3.5"><span className="block h-full rounded-lg bg-ink/5" /></li>)}
                </motion.ol>
              </AnimatePresence>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* refused */}
              <div className="rounded-[1.6rem] bg-[#f6e3da] p-5 sm:p-6" data-testid="refused">
                <p className="eyebrow !text-clay">Refused</p>
                <ul className="mt-3 space-y-4">
                  {(plan?.refused ?? []).map((r) => (
                    <li key={r.product.id}>
                      <p className="font-semibold text-ink line-through decoration-clay decoration-2">{r.product.name}</p>
                      <p className="mt-0.5 text-[0.85rem] leading-snug text-ink-2">{cap(r.reason)}.</p>
                    </li>
                  ))}
                </ul>
                {!plan && <p className="mt-2 text-sm text-ink-3">Products the agent will not recommend appear here.</p>}
              </div>
              {/* basket */}
              <div className="flex flex-col rounded-[1.6rem] bg-ink p-5 text-paper sm:p-6" data-testid="basket">
                <p className="eyebrow !text-paper/60">Start with three</p>
                <ul className="mt-3 flex-1 space-y-2 text-[0.92rem]">
                  {(plan?.essentials ?? []).map((p) => (
                    <li key={p.product.id} className="flex justify-between gap-3"><span>{p.product.name}</span><span className="tnum text-paper/70">{ghs(p.product.priceGhs)}</span></li>
                  ))}
                </ul>
                {plan && (
                  <>
                    <div className="mt-4 flex items-baseline justify-between border-t border-paper/15 pt-3">
                      <span className="text-sm text-paper/70">Total</span><span className="display tnum text-2xl">{ghs(plan.essentialsGhs)}</span>
                    </div>
                    <p className="mt-1 text-[0.75rem] text-paper/50">Full routine {ghs(plan.totalGhs)}. House-label sample catalogue.</p>
                    <CopyList plan={plan} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CopyList({ plan }: { plan: Plan }) {
  const [done, setDone] = useState(false);
  const text = `My Shea list\n${plan.essentials.map((p) => `- ${p.product.name} (${p.product.ingredients[0]})`).join("\n")}\nAvoid: ${plan.refused.map((r) => r.product.ingredients[0]).join(", ")}`;
  return (
    <button type="button" className="mt-4 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre-2"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked */ } }}>
      {done ? "Copied ✓" : "Copy list for the shop"}
    </button>
  );
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
