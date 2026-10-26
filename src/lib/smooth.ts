import Lenis from "lenis";
import { frame, cancelFrame } from "framer-motion";

export function startSmoothScroll() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
  const update = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
  frame.update(update, true);
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a || a.getAttribute("href") === "#") return;
    const el = document.querySelector(a.getAttribute("href")!); if (!el) return;
    e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -64 });
  };
  document.addEventListener("click", onClick);
  return () => { cancelFrame(update); document.removeEventListener("click", onClick); lenis.destroy(); };
}
