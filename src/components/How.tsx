import { Credit, Photo } from "./Photo";
import { Reveal } from "./Reveal";

const APIS = [
  { n: "01", name: "AI Skin Analysis", body: "Eight concerns from one selfie: dark marks, acne, under-eye, oil, moisture, pores, texture, radiance. Each returns a score and a mask.", cost: "12 units" },
  { n: "02", name: "Facial Color Tones", body: "Skin, lip, eye and hair colour as hex. Shea converts skin colour to CIELAB to get depth and undertone.", cost: "20 units" },
  { n: "03", name: "Clothes Virtual Try-On", body: "Puts a garment photo on a full-length photo. Shea only sends the pieces its colour maths ranked highest.", cost: "2 units" },
];

export function How() {
  return (
    <section id="how" className="border-t rule">
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <p className="eyebrow">04 · How it works</p>
          <h2 className="display mt-3 max-w-2xl text-4xl leading-[1.02] sm:text-5xl">Three YouCam APIs, <span className="display-wonk">one honest agent.</span></h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {APIS.map((a, i) => (
            <Reveal key={a.n} delay={i * 0.08} className="flex flex-col rounded-[1.6rem] bg-paper-2/70 p-6 md:col-span-2">
              <p className="display tnum text-4xl text-ochre">{a.n}</p>
              <h3 className="mt-6 text-lg font-semibold">{a.name}</h3>
              <p className="mt-2 flex-1 text-[0.93rem] leading-relaxed text-ink-2">{a.body}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{a.cost} per call</p>
            </Reveal>
          ))}
          <Reveal className="rounded-[1.6rem] bg-ink p-6 text-paper md:col-span-4">
            <p className="eyebrow !text-paper/50">The agent in between</p>
            <ol className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Re-weight", "Dark marks ×1.4 and under-eye ×1.2 for deep skin; oil up and moisture down for humid air."],
                ["Guard", "Rejects hydroquinone, mercury and steroid creams, and mineral SPF that greys deep skin."],
                ["Build", "One product per step, morning and evening, never doubling up on actives."],
                ["Style", "Ranks garments by WCAG contrast, undertone harmony and chroma before any try-on is spent."],
              ].map(([t, d]) => <li key={t}><p className="font-semibold text-ochre-2">{t}</p><p className="mt-1 text-[0.9rem] leading-relaxed text-paper/75">{d}</p></li>)}
            </ol>
            <p className="mt-6 border-t border-paper/15 pt-4 text-[0.82rem] text-paper/55">Your key stays on the server. Photos are sent to YouCam for analysis and are not stored by Shea. A full run costs about 36 units.</p>
          </Reveal>
          <Reveal className="relative min-h-[16rem] overflow-hidden rounded-[1.6rem] md:col-span-2">
            <Photo name="weave" sizes="(min-width:768px) 30vw, 92vw" className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-4 text-paper">
              <p className="display text-2xl leading-tight">Made for Accra first.</p>
              <Credit name="weave" dark className="mt-1" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
