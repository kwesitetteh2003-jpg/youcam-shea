import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Credit, Photo } from "./Photo";

const MOMENTS = [
  { photo: "mirror", time: "07:10 · the mirror", title: "The spot is gone. The mark isn't.", body: "On deep skin, the dark mark a breakout leaves can stay for months. Ama scans before work, and Shea ranks that mark first, not the acne." },
  { photo: "market", time: "12:40 · the market", title: "Every shelf promises “fair”.", body: "The fastest creams on the stall work by bleaching or thinning skin. Shea names the ingredient, refuses it, and points her to a safe fader instead." },
  { photo: "patches", time: "21:30 · the routine", title: "Four steps she'll actually keep.", body: "Light textures for a humid night, a mark fader that doesn't bleach, and a tinted SPF for tomorrow that won't turn her grey." },
];

export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  if (reduce) return <StaticStory />;
  return (
    <section ref={ref} className="relative h-[320vh] bg-night text-paper" aria-label="A day with Shea">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1320px] flex-1 gap-6 px-5 pb-8 pt-20 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="relative order-2 h-[44svh] lg:order-1 lg:col-span-6 lg:h-[72svh]">
            {MOMENTS.map((m, i) => <Frame key={m.photo} i={i} p={scrollYProgress} photo={m.photo} />)}
          </div>
          <div className="relative order-1 min-h-[15.5rem] lg:order-2 lg:col-span-5 lg:col-start-8 lg:min-h-[22rem]">
            <p className="eyebrow !text-paper/50">A day with Shea · Ama, 27, Accra</p>
            {MOMENTS.map((m, i) => <Copy key={m.photo} i={i} p={scrollYProgress} m={m} />)}
          </div>
        </div>
        <Progress p={scrollYProgress} />
      </div>
    </section>
  );
}

function range(i: number) { const a = i / 3, b = (i + 1) / 3; return [a, b] as const; }
const c01 = (x: number) => Math.min(1, Math.max(0, x));

function Frame({ i, p, photo }: { i: number; p: MotionValue<number>; photo: string }) {
  const [a, b] = range(i);
  const clip = useTransform(p, [c01(a - 0.12), c01(a + 0.08)], i === 0 ? ["inset(0% 0% 0% 0% round 1.6rem)", "inset(0% 0% 0% 0% round 1.6rem)"] : ["inset(100% 0% 0% 0% round 1.6rem)", "inset(0% 0% 0% 0% round 1.6rem)"]);
  const scale = useTransform(p, [c01(a - 0.1), c01(b)], [i === 0 ? 1.08 : 1.18, 1]);
  return (
    <motion.div className="absolute inset-0 overflow-hidden rounded-[1.6rem]" style={{ clipPath: clip, zIndex: i }}>
      <motion.div className="h-full w-full" style={{ scale }}><Photo name={photo} sizes="(min-width:1024px) 46vw, 92vw" className="h-full w-full" /></motion.div>
      <div className="absolute bottom-3 left-4"><Credit name={photo} dark /></div>
    </motion.div>
  );
}

function Copy({ i, p, m }: { i: number; p: MotionValue<number>; m: (typeof MOMENTS)[number] }) {
  const [a, b] = range(i);
  const opacity = useTransform(p, i === 0 ? [0, b - 0.06, b] : i === 2 ? [a - 0.04, a + 0.04, 1] : [a - 0.04, a + 0.04, b - 0.06, b], i === 0 ? [1, 1, 0] : i === 2 ? [0, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(p, [c01(a - 0.05), c01(a + 0.06)], i === 0 ? [0, 0] : [36, 0]);
  return (
    <motion.div className="absolute inset-x-0 top-8" style={{ opacity, y }}>
      <p className="tnum text-sm text-ochre-2">{m.time}</p>
      <h3 className="display mt-2 text-[2rem] leading-[1.05] sm:text-5xl">{m.title}</h3>
      <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-paper/75">{m.body}</p>
    </motion.div>
  );
}

function Progress({ p }: { p: MotionValue<number> }) {
  const w = useTransform(p, [0, 1], ["0%", "100%"]);
  return <div className="mx-auto mb-6 h-px w-[min(1320px,calc(100%-2.5rem))] bg-paper/15"><motion.div className="h-px bg-ochre-2" style={{ width: w }} /></div>;
}

function StaticStory() {
  return (
    <section className="bg-night px-5 py-20 text-paper sm:px-8" aria-label="A day with Shea">
      <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-3">
        {MOMENTS.map((m) => (
          <article key={m.photo}>
            <Photo name={m.photo} sizes="(min-width:768px) 30vw, 92vw" className="aspect-[4/5] rounded-[1.6rem]" />
            <Credit name={m.photo} dark className="mt-2" />
            <p className="mt-4 text-sm text-ochre-2">{m.time}</p><h3 className="display mt-1 text-3xl">{m.title}</h3>
            <p className="mt-3 text-paper/75">{m.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
