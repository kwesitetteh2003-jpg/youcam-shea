// A real YouCam result for the sample portrait (public/src/face-scan.jpg, Evlogia Pictures / Pexels), recorded from one live scan.
// In live mode the page shows this on load instead of spending units on every visit; it is labelled as recorded.
// Masks were downloaded to public/recorded/masks/ because YouCam's mask URLs are presigned and expire.
import type { SkinResult, ToneResult } from "./types";
export const RECORDED: { at: string; skin: SkinResult; tone: ToneResult } | null = {
  "at": "2026-10-29T08:32:00Z",
  "skin": {
    "scores": [
      {
        "concern": "pore",
        "score": 78,
        "raw": 74.15,
        "maskUrl": "/recorded/masks/pore.webp"
      },
      {
        "concern": "age_spot",
        "score": 96,
        "raw": 98.46,
        "maskUrl": "/recorded/masks/age_spot.webp"
      },
      {
        "concern": "texture",
        "score": 70,
        "raw": 56.73,
        "maskUrl": "/recorded/masks/texture.webp"
      },
      {
        "concern": "oiliness",
        "score": 65,
        "raw": 43.6,
        "maskUrl": "/recorded/masks/oiliness.webp"
      },
      {
        "concern": "radiance",
        "score": 93,
        "raw": 95.78,
        "maskUrl": "/recorded/masks/radiance.webp"
      },
      {
        "concern": "dark_circle_v2",
        "score": 83,
        "raw": 91.39,
        "maskUrl": "/recorded/masks/dark_circle_v2.webp"
      },
      {
        "concern": "acne",
        "score": 83,
        "raw": 85.0,
        "maskUrl": "/recorded/masks/acne.webp"
      },
      {
        "concern": "moisture",
        "score": 71,
        "raw": 53.18,
        "maskUrl": "/recorded/masks/moisture.webp"
      }
    ]
  },
  "tone": {
    "skin": "#79563B",
    "lip": "#CB8167",
    "eye": "#0F0A07",
    "eyeName": "Brown",
    "hair": "#B56637",
    "hairName": "Auburn"
  }
};
/** Real Clothes VTO renders of the sample model, by garment id, saved under public/recorded/. Used only as a labelled fallback. */
export const RECORDED_TRYON: Record<string, string> = { "g-linen": "/recorded/tryon-g-linen.webp" };
