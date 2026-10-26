import credits from "../../scripts/photo-credits.json";
type Name = keyof typeof credits;
const WIDTHS: Record<string, number[]> = { garment: [480, 960], "face-scan": [480, 720, 1080], default: [640, 1080, 1600] };

export function photoSet(name: string) {
  const w = name.startsWith("g-") ? WIDTHS.garment : WIDTHS[name] ?? WIDTHS.default;
  return { src: `/photos/${name}-${w[Math.min(1, w.length - 1)]}.webp`, srcSet: w.map((x) => `/photos/${name}-${x}.webp ${name === "face-scan" && x === 1080 ? 900 : x}w`).join(", ") };
}
export const credit = (name: string) => (credits as Record<string, { by: string; url: string; alt: string }>)[name];

export function Photo({ name, sizes, className = "", alt, priority, imgClassName = "" }: { name: Name | string; sizes: string; className?: string; alt?: string; priority?: boolean; imgClassName?: string }) {
  const s = photoSet(name);
  return (
    <div className={`overflow-hidden bg-paper-2 ${className}`}>
      <img {...s} sizes={sizes} alt={alt ?? credit(name)?.alt ?? ""} loading={priority ? "eager" : "lazy"} decoding="async"
        fetchPriority={priority ? "high" : "auto"} className={`h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}

export function Credit({ name, className = "", dark }: { name: string; className?: string; dark?: boolean }) {
  const c = credit(name); if (!c) return null;
  return <p className={`caption ${dark ? "!text-paper/55" : ""} ${className}`}>Photo: <a href={c.url} target="_blank" rel="noreferrer">{c.by} / Pexels</a></p>;
}
