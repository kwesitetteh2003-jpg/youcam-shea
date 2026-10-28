// A real YouCam result for the sample portrait (public/src/face-scan.jpg), recorded from one live scan.
// In live mode the page shows this on load instead of spending units on every visit; it is labelled as recorded.
import type { SkinResult, ToneResult } from "./types";
export const RECORDED: { at: string; skin: SkinResult; tone: ToneResult } | null = null;
/** Real Clothes VTO renders of the sample model, by garment id, saved under public/recorded/. Used only as a labelled fallback. */
export const RECORDED_TRYON: Record<string, string> = { "g-linen": "/recorded/tryon-g-linen.webp" };
