import { credit } from "./Photo";
const USED = ["face", "body", "mirror", "patches", "market", "weave", "portrait", "g-linen", "g-rose-shirt", "g-sage-tee", "g-olive-shirt", "g-floral-dress"];

export function Closing() {
  return (
    <section className="mx-auto max-w-[1320px] px-5 pb-10 sm:px-8">
      <div className="grid overflow-hidden rounded-[2rem] bg-ochre md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <h2 className="display text-4xl leading-[1.02] text-ink sm:text-5xl">Your skin, <span className="display-wonk">read properly.</span></h2>
          <p className="mt-4 max-w-sm text-ink/80">Thirty seconds, one selfie, no bleach.</p>
          <a href="#scan" className="btn btn-primary mt-7 self-start">Start a scan</a>
        </div>
        <div className="relative min-h-[20rem]">
          <img src="/photos/portrait-1080.webp" srcSet="/photos/portrait-640.webp 640w, /photos/portrait-1080.webp 1080w" sizes="(min-width:768px) 46vw, 92vw" alt={credit("portrait")?.alt ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1320px] px-5 pb-12 pt-8 text-[0.8rem] text-ink-3 sm:px-8">
      <div className="hairline mb-6" />
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="display text-xl text-ink">Shea</p>
          <p className="mt-2 max-w-xs">An entry for the YouCam API Skin AI &amp; eCommerce VTO hackathon. Not medical advice; see a dermatologist for persistent concerns. Product names are a fictional house label.</p>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow">Photography, via Pexels</p>
          <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {USED.map((n) => { const c = credit(n); return c && <li key={n}><a href={c.url} target="_blank" rel="noreferrer" className="hover:text-ink">{c.by}</a> · <span>{n.startsWith("g-") ? "garment" : n}</span></li>; })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
