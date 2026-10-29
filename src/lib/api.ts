import type { Mode, Plan, ResultMode, SkinResult, TaskKind, TaskPoll, ToneResult, TryOnResult } from "../../shared/types";
import { plan as localPlan } from "../../shared/agent";

/** The server says: show the labelled sample instead (units used up, a cap hit, or YouCam errored). */
export class FallbackError extends Error {}
async function j<T>(r: Response): Promise<T> {
  const b = await r.json().catch(() => ({}));
  if (!r.ok) { const m = (b as { error?: string }).error || `Request failed (${r.status})`; throw (b as { fallback?: boolean }).fallback ? new FallbackError(m) : new Error(m); }
  return b as T;
}
/** Header pill: "live" only when YouCam actually accepts the key (free credit check), so a rejected key never shows Live. */
export const getStatus = () =>
  fetch("/api/health").then((r) => j<{ youcam: "ok" | "rejected" | "unreachable" | "no_key" }>(r)).then((h): { mode: Mode } => ({ mode: h.youcam === "ok" ? "live" : "demo" }));

/** Downscale to <= 1280px and re-encode as JPEG so uploads stay small and EXIF-free. */
export async function toJpegDataUrl(src: string | Blob, max = 1280): Promise<string> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = new Image(); img.decoding = "async"; img.src = url; await img.decode();
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.88);
  } finally { if (typeof src !== "string") URL.revokeObjectURL(url); }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function pollTask<T>(kind: TaskKind, id: string, timeoutMs = 120000): Promise<T> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    await sleep(2200);
    const p = await fetch(`/api/task?kind=${kind}&id=${encodeURIComponent(id)}`).then((r) => j<TaskPoll<T>>(r));
    if (p.status === "success") return p.result as T;
    if (p.status === "error") throw new FallbackError(p.error || "YouCam task failed");
  }
  throw new FallbackError("YouCam took too long.");
}

/** image: a JPEG data URL of the user's photo, or undefined for the sample (which never spends units). */
export async function scan(image: string | undefined): Promise<{ mode: ResultMode; skin: SkinResult; tone: ToneResult; recordedAt?: string }> {
  const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(image ? { image } : { sample: true }) })
    .then((x) => j<{ mode: ResultMode; recordedAt?: string; skin?: TaskPoll<SkinResult>; tone?: TaskPoll<ToneResult>; skinTask?: string; toneTask?: string }>(x));
  if (r.mode !== "live") return { mode: r.mode, skin: r.skin!.result!, tone: r.tone!.result!, recordedAt: r.recordedAt };
  const [skin, tone] = await Promise.all([pollTask<SkinResult>("skin", r.skinTask!), pollTask<ToneResult>("tone", r.toneTask!)]);
  return { mode: "live", skin, tone };
}

export async function makePlan(skin: SkinResult, tone: ToneResult): Promise<Plan> {
  try {
    return await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scores: skin.scores, tone }) }).then((r) => j<Plan>(r));
  } catch { return localPlan(skin.scores, tone); } // same agent code runs in the browser if the API is unreachable
}

export async function tryOn(person: string, garment: string, category: string): Promise<{ mode: Mode; result?: TryOnResult }> {
  const r = await fetch("/api/tryon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ person, garment, category }) })
    .then((x) => j<{ mode: Mode; task?: string }>(x));
  if (r.mode === "demo") return { mode: "demo" };
  return { mode: "live", result: await pollTask<TryOnResult>("cloth", r.task!, 150000) };
}
