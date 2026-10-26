import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import type { GarmentPick, Mode } from "../../shared/types";
import { rankGarments } from "../../shared/agent";
import { DEMO_TONE } from "../../shared/fixtures";
import { tryOn, toJpegDataUrl } from "../lib/api";
import { ghs } from "../lib/format";
import { Credit, Photo, photoSet } from "./Photo";
import { Reveal } from "./Reveal";

type State = { id: string; status: "running" | "done" | "needs_key" | "error"; url?: string; error?: string };

export function TryOn({ picks, skin, mode }: { picks?: GarmentPick[]; skin?: string; mode: Mode | "unknown" }) {
  const list = picks ?? rankGarments(DEMO_TONE.skin);
  const [active, setActive] = useState(list[0].garment.id);
  const [state, setState] = useState<State>();
  const [person, setPerson] = useState<{ src: string; file?: File }>({ src: "" });
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const pick = list.find((p) => p.garment.id === active) ?? list[0];

  async function run(p: GarmentPick) {
    setActive(p.garment.id); setState({ id: p.garment.id, status: "running" });
    const r0 = stage.current?.getBoundingClientRect(); // on phones the garment list sits below the photo
    if (r0 && (r0.bottom < 120 || r0.top > innerHeight)) stage.current!.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    try {
      const live = mode === "live";
      const [personImg, garmentImg] = live ? await Promise.all([toJpegDataUrl(person.file ?? "/src/body.jpg"), toJpegDataUrl(`/src/${p.garment.id}.jpg`)]) : ["", ""];
      const r = await tryOn(personImg, garmentImg, p.garment.category);
      setState(r.mode === "demo" ? { id: p.garment.id, status: "needs_key" } : { id: p.garment.id, status: "done", url: r.result!.url });
    } catch (e) { setState({ id: p.garment.id, status: "error", error: e instanceof Error ? e.message : String(e) }); }
  }
  const s = state?.id === pick.garment.id ? state : undefined;

  return (
    <section id="tryon" className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">
      <Reveal className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow">03 · Try-on</p>
          <h2 className="display mt-3 text-4xl leading-[1.02] sm:text-5xl">Colour, <span className="display-wonk">measured</span> against your skin.</h2>
        </div>
        <p className="max-w-xl self-end text-[1.02rem] leading-relaxed text-ink-2 lg:col-span-5 lg:col-start-8">
          Each piece is ranked by its contrast with your scanned skin colour{skin && <> (<span className="inline-block h-3 w-3 translate-y-[1px] rounded-full align-baseline" style={{ background: skin }} /> {skin.toUpperCase()})</>}, how its hue sits with your undertone, and how much colour it carries. Then YouCam's Clothes VTO puts it on.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div ref={stage} className="relative scroll-mt-20 aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-[#f3f1ee] lg:aspect-auto lg:h-[min(78svh,44rem)]">
            {person.src ? <img src={person.src} alt="Your full-length photo" className="h-full w-full object-cover" />
              : <img {...photoSet("body")} sizes="(min-width:1024px) 34vw, 92vw" alt="Full-length model in a black top, used as the try-on sample" loading="lazy" className="h-full w-full object-cover object-top" />}
            <AnimatePresence>
              {s?.status === "done" && s.url && (
                <motion.img key={s.url} src={s.url} alt={`Try-on result: ${pick.garment.name}`} className="absolute inset-0 h-full w-full object-cover"
                  initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }} />
              )}
            </AnimatePresence>
            {s?.status === "running" && (
              <div className="absolute inset-0 grid place-items-center bg-paper/40 backdrop-blur-[2px]"><p className="rounded-full bg-ink px-4 py-2 text-sm text-paper">YouCam is dressing the photo…</p></div>
            )}
            {s?.status === "needs_key" && (
              <div className="absolute inset-x-3 top-3 flex items-center gap-3 rounded-2xl bg-ink/85 p-3 text-paper backdrop-blur" data-testid="needs-key">
                <Photo name={pick.garment.id} sizes="64px" className="h-16 w-14 shrink-0 rounded-lg" />
                <p className="text-[0.82rem] leading-snug">Demo mode: no render is faked. With a YouCam key, Clothes VTO puts <b>{pick.garment.name}</b> on this photo (2 units).</p>
              </div>
            )}
            {s?.status === "error" && <p className="absolute inset-x-3 bottom-3 rounded-2xl bg-clay p-3 text-sm text-paper">{s.error}</p>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {!person.src ? <Credit name="body" /> : <button className="caption underline" onClick={() => setPerson({ src: "" })}>Use the sample model</button>}
            <label className="cursor-pointer text-sm font-medium underline underline-offset-4">
              Use my full-length photo
              <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPerson({ src: URL.createObjectURL(f), file: f }); setState(undefined); } }} />
            </label>
          </div>
        </div>

        <ol className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-7" data-testid="garments">
          {list.map((p, i) => (
            <li key={p.garment.id}>
              <div className={`group flex h-full gap-4 rounded-[1.3rem] p-3 transition-colors ${active === p.garment.id ? "bg-ink text-paper" : "bg-paper-2/60 hover:bg-paper-2"}`}>
                <button type="button" onClick={() => { setActive(p.garment.id); }} className="relative shrink-0" title={`Show ${p.garment.name}`}>
                  <Photo name={p.garment.id} sizes="120px" className="h-32 w-24 rounded-xl" />
                  <span className="display absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-paper text-xs text-ink">{i + 1}</span>
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="font-semibold leading-tight">{p.garment.name}</p>
                  <p className={`text-[0.8rem] ${active === p.garment.id ? "text-paper/65" : "text-ink-3"}`}>{p.garment.colour} · {ghs(p.garment.priceGhs)}</p>
                  <div className="mt-2 flex items-center gap-2" title={`Contrast ${p.contrast.toFixed(1)}:1 against skin`}>
                    <span className="flex h-6 overflow-hidden rounded-full ring-1 ring-black/10">
                      <span className="w-6" style={{ background: skin ?? DEMO_TONE.skin }} /><span className="w-6" style={{ background: p.garment.hex }} />
                    </span>
                    <span className="tnum text-sm font-semibold">{p.contrast.toFixed(1)}:1</span>
                  </div>
                  <p className={`mt-1.5 line-clamp-3 text-[0.8rem] leading-snug ${active === p.garment.id ? "text-paper/75" : "text-ink-2"}`}>{p.reason[0].toUpperCase() + p.reason.slice(1)}</p>
                  <button type="button" onClick={() => run(p)} disabled={state?.status === "running"}
                    className={`mt-auto self-start rounded-full px-3.5 py-1.5 text-[0.8rem] font-semibold ${active === p.garment.id ? "bg-ochre-2 text-ink" : "bg-ink text-paper"} disabled:opacity-50`}>
                    Try it on
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
