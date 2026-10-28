// Shared shapes between the browser, the API routes and the agent.
export const CONCERNS = ["acne", "age_spot", "dark_circle_v2", "oiliness", "moisture", "pore", "texture", "radiance"] as const;
export type Concern = (typeof CONCERNS)[number];

/** One normalised YouCam AI Skin Analysis result. ui_score: 0-100, higher = healthier. */
export interface SkinScore { concern: Concern; score: number; raw?: number; maskUrl?: string }
export interface SkinResult { scores: SkinScore[]; overlayUrl?: string }

/** YouCam Facial Color Tones Analyzer result (hex colours). */
export interface ToneResult { skin: string; lip?: string; eye?: string; eyeName?: string; hair?: string; hairName?: string }

export type Mode = "demo" | "live";
/** Where a result came from: a live call, a recorded real YouCam result for the sample, or demo fixtures. */
export type ResultMode = Mode | "recorded";
export type TaskKind = "skin" | "tone" | "cloth";
export interface TaskPoll<T = unknown> { status: "running" | "success" | "error"; result?: T; error?: string }
export interface TryOnResult { url: string }

export interface Climate { city: string; humidity: "low" | "mid" | "high"; uv: "moderate" | "high" | "very_high" }

export type Step = "cleanse" | "treat" | "moisturise" | "protect" | "eye";
export interface Product {
  id: string; name: string; step: Step; when: ("am" | "pm")[];
  ingredients: string[]; texture: "gel" | "cream" | "fluid" | "balm" | "foam";
  targets: Partial<Record<Concern, number>>; // 0-1, how much it helps
  priceGhs: number; note?: string;
  /** Mineral-only SPF tends to leave a grey cast on deep skin. */
  whiteCast?: boolean;
}
export interface Garment {
  id: string; name: string; colour: string; hex: string;
  category: "upper_body" | "lower_body" | "full_body"; priceGhs: number; photoBy: string;
}

export interface TraceStep { id: string; title: string; detail: string; kind: "observe" | "reason" | "guard" | "act" }
export interface Pick { product: Product; reason: string }
export interface Refusal { product: Product; reason: string }
export interface GarmentPick { garment: Garment; score: number; contrast: number; reason: string }
export interface Plan {
  priorities: { concern: Concern; label: string; weight: number; score: number; why: string }[];
  undertone: "warm" | "neutral" | "cool"; depth: "deep" | "medium-deep" | "medium" | "light";
  am: Pick[]; pm: Pick[]; refused: Refusal[]; garments: GarmentPick[]; trace: TraceStep[];
  totalGhs: number;
  /** Start here: cleanser, the top treatment, SPF. */
  essentials: Pick[]; essentialsGhs: number;
}
