// Minimal YouCam API client (server-side only; the key never reaches the browser).
// Docs: https://yce.perfectcorp.com/document/ — File API → AI task → poll.
import { CONCERNS, type SkinResult, type TaskKind, type TaskPoll, type ToneResult, type TryOnResult } from "../shared/types";

export interface YouCamConfig { apiKey: string; base: string }
const PATH: Record<TaskKind, string> = { skin: "skin-analysis", tone: "skin-tone-analysis", cloth: "cloth-v4" };

export class YouCamError extends Error { constructor(msg: string, public status = 502, public code?: string) { super(msg); } }

export class YouCam {
  constructor(private cfg: YouCamConfig, private f: typeof fetch = fetch) {}

  private async call(method: string, path: string, body?: unknown) {
    const r = await this.f(this.cfg.base + path, {
      method, headers: { Authorization: `Bearer ${this.cfg.apiKey}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000),
    });
    const text = await r.text(); let j: any; try { j = JSON.parse(text); } catch { j = { error: text.slice(0, 200) }; }
    if (!r.ok || (j.status && j.status >= 400)) throw new YouCamError(j.error || j.message || `YouCam ${r.status}`, r.status === 401 || r.status === 403 ? 401 : 502, j.error_code);
    return j.data ?? j;
  }

  /** Register a file, PUT its bytes to the presigned URL, return file_id. */
  async upload(bytes: Uint8Array, contentType: "image/jpeg" | "image/png", name: string): Promise<string> {
    const d = await this.call("POST", "/s2s/v2.0/file", { files: [{ content_type: contentType, file_name: name, file_size: bytes.byteLength }] });
    const file = d.files?.[0]; const req = file?.requests?.[0];
    if (!file?.file_id || !req?.url) throw new YouCamError("File API returned no upload URL");
    const put = await this.f(req.url, { method: req.method || "PUT", headers: req.headers ?? { "Content-Type": contentType }, body: bytes as unknown as BodyInit, signal: AbortSignal.timeout(30000) });
    if (!put.ok) throw new YouCamError(`upload failed (${put.status})`);
    return file.file_id as string;
  }

  /** Units left on the account (free call). Expired grants are ignored. */
  async credits(): Promise<number> {
    const d = await this.call("GET", "/s2s/v1.0/client/credit");
    const list: any[] = Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : [];
    return list.filter((c) => !c.expiry || c.expiry > Date.now()).reduce((n, c) => n + (Number(c.amount_dec ?? c.amount) || 0), 0);
  }

  async startSkin(fileId: string) {
    const d = await this.call("POST", "/s2s/v2.0/task/skin-analysis", { src_file_id: fileId, dst_actions: [...CONCERNS], miniserver_args: { enable_mask_overlay: true }, format: "json" });
    return d.task_id as string;
  }
  async startTone(fileId: string) {
    const d = await this.call("POST", "/s2s/v2.0/task/skin-tone-analysis", { src_file_id: fileId });
    return d.task_id as string;
  }
  async startCloth(srcFileId: string, refFileId: string, category: string) {
    const d = await this.call("POST", "/s2s/v2.0/task/cloth-v4", { src_file_id: srcFileId, ref_file_id: refFileId, garment_category: category });
    return d.task_id as string;
  }

  async poll(kind: TaskKind, id: string): Promise<TaskPoll> {
    const d = await this.call("GET", `/s2s/v2.0/task/${PATH[kind]}/${encodeURIComponent(id)}`);
    const st = d.task_status;
    if (st === "error") return { status: "error", error: friendlyError(d.error || d.error_message || "task failed") };
    if (st !== "success") return { status: "running" };
    return { status: "success", result: kind === "skin" ? parseSkin(d.results) : kind === "tone" ? parseTone(d.results) : parseCloth(d.results) };
  }
}

export function parseSkin(results: any): SkinResult {
  const out: any[] = Array.isArray(results?.output) ? results.output : Array.isArray(results) ? results : [];
  const scores = out
    .map((o) => ({ concern: String(o.type).replace(/^hd_/, "") as any, score: Math.round(Number(o.ui_score)), raw: Number(o.raw_score), maskUrl: firstUrl(o.mask_urls ?? o.mask_url) }))
    .filter((s) => (CONCERNS as readonly string[]).includes(s.concern) && Number.isFinite(s.score));
  const o = out.find((o) => /overlay|all/i.test(String(o.type)));
  if (!scores.length) throw new YouCamError("skin result had no scores");
  return { scores, overlayUrl: firstUrl(o?.mask_urls ?? o?.mask_url) };
}
const firstUrl = (v: unknown): string | undefined => (Array.isArray(v) ? v[0] : typeof v === "string" ? v : undefined);
const hex = (v: unknown) => (typeof v === "string" && /^#?[0-9a-f]{6}$/i.test(v) ? (v.startsWith("#") ? v : "#" + v).toUpperCase() : undefined);
export function parseTone(results: any): ToneResult {
  const c = results?.color ?? results ?? {};
  const pick = (k: string) => hex(c[k] ?? c[k.replace("_color", "")]?.color ?? c[k.replace("_color", "")]);
  const skin = pick("skin_color");
  if (!skin) throw new YouCamError("tone result missing skin_color");
  return { skin, lip: pick("lip_color"), eye: pick("eye_color"), eyeName: c.eye_color_name, hair: pick("hair_color"), hairName: c.hair_color_name };
}
export function parseCloth(results: any): TryOnResult {
  const url = results?.url ?? results?.urls?.[0] ?? results?.output?.[0]?.url;
  if (!url) throw new YouCamError("try-on result missing url");
  return { url };
}
const FRIENDLY: Record<string, string> = {
  error_no_face: "No face found. Try a front-facing photo in good light.",
  error_src_face_too_small: "Move closer: your face should fill most of the frame.",
  error_src_face_out_of_bound: "Your face is cut off. Centre it in the frame.",
  error_lighting_dark: "Too dark. Face a window and try again.",
  error_below_min_image_size: "Photo is too small (min 480 px on the short side).",
};
export function friendlyError(code: string) { return FRIENDLY[code] ?? code; }
