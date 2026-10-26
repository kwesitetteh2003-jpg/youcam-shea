// Small colour helpers: hex <-> sRGB <-> CIELAB, WCAG contrast, undertone/depth heuristics.
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  if (Number.isNaN(n)) throw new Error("bad hex " + hex);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
export function luminance(hex: string) { const [r, g, b] = hexToRgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export function contrast(a: string, b: string) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
export function toLab(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(lin);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  return { L: 116 * f(Y) - 16, a: 500 * (f(X) - f(Y)), b: 200 * (f(Y) - f(Z)) };
}
/** Hue angle of skin in LCh: higher (more yellow) = warmer, lower (more red/pink) = cooler. */
export function undertoneOf(hex: string): "warm" | "neutral" | "cool" {
  const { a, b } = toLab(hex); const h = (Math.atan2(b, a) * 180) / Math.PI;
  return h >= 54 ? "warm" : h >= 44 ? "neutral" : "cool";
}
export function depthOf(hex: string): "deep" | "medium-deep" | "medium" | "light" {
  const { L } = toLab(hex); return L < 42 ? "deep" : L < 55 ? "medium-deep" : L < 68 ? "medium" : "light";
}
export function hueOf(hex: string) { const { a, b } = toLab(hex); return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360; }
export function chromaOf(hex: string) { const { a, b } = toLab(hex); return Math.hypot(a, b); }
