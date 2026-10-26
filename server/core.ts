// Dependency-free API router shared by the local dev server and the Vercel function.
import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import { YouCam, YouCamError } from "./youcam";
import { plan } from "../shared/agent";
import { DEMO_SKIN, DEMO_TONE } from "../shared/fixtures";
import { CONCERNS, type SkinScore, type TaskKind, type ToneResult } from "../shared/types";

export interface Config { mode: "demo" | "live"; apiKey?: string; base: string; dailyUnitCap: number; perIpDaily: number }
export function readConfig(env = process.env): Config {
  const apiKey = env.YOUCAM_API_KEY?.trim() || undefined;
  return {
    mode: apiKey ? "live" : "demo", apiKey,
    base: (env.YOUCAM_API_BASE || "https://yce-api-01.makeupar.com").replace(/\/$/, ""),
    dailyUnitCap: Number(env.YOUCAM_DAILY_UNIT_CAP || 300), perIpDaily: Number(env.YOUCAM_PER_IP_DAILY || 12),
  };
}
// Unit cost per task (SD skin analysis with 8 concerns = 12; tone = 20; clothes = 2).
const COST: Record<"scan" | "tryon", number> = { scan: 32, tryon: 2 };

type Json = Record<string, unknown>;
const MAX_BODY = 4_000_000;
async function readJson(req: IncomingMessage): Promise<Json> {
  const chunks: Buffer[] = []; let n = 0;
  for await (const c of req) { n += (c as Buffer).length; if (n > MAX_BODY) throw new HttpError(413, "Image too large. Keep it under 3 MB."); chunks.push(c as Buffer); }
  if (!n) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new HttpError(400, "Body must be JSON"); }
}
class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(body));
}
export function decodeImage(v: unknown): { bytes: Uint8Array; type: "image/jpeg" | "image/png" } {
  const m = typeof v === "string" ? /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(v) : null;
  if (!m) throw new HttpError(400, "image must be a JPEG or PNG data URL");
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.byteLength < 2000) throw new HttpError(400, "image is empty");
  if (bytes.byteLength > 3_000_000) throw new HttpError(413, "Image too large. Keep it under 3 MB.");
  return { bytes, type: m[1] as "image/jpeg" | "image/png" };
}
export function validScores(v: unknown): SkinScore[] {
  if (!Array.isArray(v)) throw new HttpError(400, "scores must be an array");
  return v.filter((s) => s && (CONCERNS as readonly string[]).includes(s.concern) && Number.isFinite(+s.score))
    .map((s) => ({ concern: s.concern, score: Math.max(0, Math.min(100, Math.round(+s.score))) }));
}
export function validTone(v: any): ToneResult {
  if (!v || typeof v.skin !== "string" || !/^#?[0-9a-f]{6}$/i.test(v.skin)) throw new HttpError(400, "tone.skin must be a hex colour");
  return { skin: v.skin.startsWith("#") ? v.skin : "#" + v.skin };
}

export function createHandler(cfg: Config = readConfig(), deps: { youcam?: YouCam } = {}) {
  const yc = cfg.apiKey ? deps.youcam ?? new YouCam({ apiKey: cfg.apiKey, base: cfg.base }) : undefined;
  const uploads = new Map<string, string>(); // sha1 → file_id (warm-instance cache)
  let day = "", unitsToday = 0; const perIp = new Map<string, number>();
  const spend = (ip: string, units: number) => {
    const d = new Date().toISOString().slice(0, 10); if (d !== day) { day = d; unitsToday = 0; perIp.clear(); }
    if (unitsToday + units > cfg.dailyUnitCap) throw new HttpError(429, "Today's live demo budget is used up. Demo mode still works.");
    const k = perIp.get(ip) ?? 0; if (k >= cfg.perIpDaily) throw new HttpError(429, "You've hit today's live limit for this device.");
    unitsToday += units; perIp.set(ip, k + 1);
  };
  const upload = async (img: { bytes: Uint8Array; type: "image/jpeg" | "image/png" }, label: string) => {
    const h = crypto.createHash("sha1").update(img.bytes).digest("hex");
    const hit = uploads.get(h); if (hit) return hit;
    const id = await yc!.upload(img.bytes, img.type, `${label}-${h.slice(0, 8)}.${img.type === "image/png" ? "png" : "jpg"}`);
    uploads.set(h, id); return id;
  };

  return async function handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://x"); const path = url.pathname.replace(/\/+$/, "");
    const ip = String(req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "?").split(",")[0].trim();
    try {
      if (req.method === "GET" && path === "/api/status")
        return send(res, 200, { mode: cfg.mode, apis: ["AI Skin Analysis (SD, 8 concerns)", "AI Facial Color Tones Analyzer", "AI Clothes Virtual Try-On (cloth-v4)"] });

      if (req.method === "POST" && path === "/api/scan") {
        const body = await readJson(req);
        if (!yc) return send(res, 200, { mode: "demo", skin: { status: "success", result: DEMO_SKIN }, tone: { status: "success", result: DEMO_TONE } });
        const img = decodeImage(body.image); spend(ip, COST.scan);
        const fileId = await upload(img, "face");
        const [skinTask, toneTask] = await Promise.all([yc.startSkin(fileId), yc.startTone(fileId)]);
        return send(res, 200, { mode: "live", skinTask, toneTask });
      }

      if (req.method === "GET" && path === "/api/task") {
        const kind = url.searchParams.get("kind") as TaskKind, id = url.searchParams.get("id") ?? "";
        if (!["skin", "tone", "cloth"].includes(kind) || !id || id.length > 400) throw new HttpError(400, "kind and id required");
        if (!yc) throw new HttpError(409, "Demo mode has no live tasks");
        return send(res, 200, await yc.poll(kind, id));
      }

      if (req.method === "POST" && path === "/api/tryon") {
        const body = await readJson(req);
        if (!yc) return send(res, 200, { mode: "demo", status: "needs_key" });
        const category = ["upper_body", "lower_body", "full_body", "auto"].includes(String(body.category)) ? String(body.category) : "auto";
        const person = decodeImage(body.person), garment = decodeImage(body.garment); spend(ip, COST.tryon);
        const [src, ref] = await Promise.all([upload(person, "person"), upload(garment, "garment")]);
        return send(res, 200, { mode: "live", task: await yc.startCloth(src, ref, category) });
      }

      if (req.method === "POST" && path === "/api/plan") {
        const body = await readJson(req);
        return send(res, 200, plan(validScores(body.scores), validTone(body.tone)));
      }
      send(res, 404, { error: "Not found" });
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message });
      if (e instanceof YouCamError) return send(res, e.status, { error: e.status === 401 ? "YouCam rejected the API key" : e.message, code: e.code });
      console.error(e); send(res, 500, { error: "Something went wrong" });
    }
  };
}
