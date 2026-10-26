// Demo-mode results for the sample photo. Clearly labelled in the UI as sample data, not a live reading.
// skin hex = mean cheek pixel of public/src/face-scan.jpg; scores are illustrative.
// Once a YouCam key is set, the live API replaces these for any photo; the UI labels which mode produced the results.
import type { SkinResult, ToneResult } from "./types";
export const DEMO_SKIN: SkinResult = {
  scores: [
    { concern: "age_spot", score: 64 }, { concern: "acne", score: 72 }, { concern: "dark_circle_v2", score: 66 },
    { concern: "oiliness", score: 69 }, { concern: "moisture", score: 81 }, { concern: "pore", score: 78 },
    { concern: "texture", score: 74 }, { concern: "radiance", score: 83 },
  ],
};
export const DEMO_TONE: ToneResult = { skin: "#5B3522", lip: "#6B3A3F", eye: "#2B1A14", eyeName: "Dark brown", hair: "#1C1512", hairName: "Black" };
