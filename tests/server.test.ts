import { describe, expect, it } from "vitest";
import http from "node:http";
import { createHandler, readConfig } from "../server/core";
import { YouCam, parseSkin, parseTone } from "../server/youcam";

async function serve(h: http.RequestListener) {
  const s = http.createServer(h); await new Promise<void>((r) => s.listen(0, "127.0.0.1", r));
  const port = (s.address() as any).port; return { url: `http://127.0.0.1:${port}`, close: () => s.close() };
}
const jpeg = "data:image/jpeg;base64," + Buffer.alloc(4000, 7).toString("base64");

describe("api (demo)", () => {
  it("serves status, demo scan and plan", async () => {
    const s = await serve(createHandler(readConfig({})));
    expect(await (await fetch(s.url + "/api/status")).json()).toMatchObject({ mode: "demo" });
    const scan = await (await fetch(s.url + "/api/scan", { method: "POST", body: "{}" })).json();
    expect(scan.skin.result.scores).toHaveLength(8);
    const pl = await (await fetch(s.url + "/api/plan", { method: "POST", body: JSON.stringify({ scores: scan.skin.result.scores, tone: scan.tone.result }) })).json();
    expect(pl.am.length).toBeGreaterThan(2);
    const bad = await fetch(s.url + "/api/plan", { method: "POST", body: JSON.stringify({ scores: [], tone: { skin: "red" } }) });
    expect(bad.status).toBe(400);
    s.close();
  });
});

describe("api (live, mocked YouCam)", () => {
  it("uploads, starts skin + tone tasks, polls and never leaks the key", async () => {
    const calls: { url: string; auth?: string; body?: any }[] = [];
    const fake: typeof fetch = async (u: any, init: any = {}) => {
      const url = String(u); calls.push({ url, auth: init.headers?.Authorization, body: init.body && typeof init.body === "string" ? JSON.parse(init.body) : undefined });
      const j = (d: unknown) => new Response(JSON.stringify({ status: 200, data: d }), { status: 200 });
      if (url.endsWith("/s2s/v2.0/file")) return j({ files: [{ file_id: "F1", requests: [{ method: "PUT", url: "https://s3.example/put", headers: { "Content-Type": "image/jpeg" } }] }] });
      if (url === "https://s3.example/put") return new Response("", { status: 200 });
      if (url.endsWith("/task/skin-analysis")) return j({ task_id: "S1" });
      if (url.endsWith("/task/skin-tone-analysis")) return j({ task_id: "T1" });
      if (url.includes("/task/skin-analysis/S1")) return j({ task_status: "success", results: { output: [{ type: "acne", ui_score: 70, raw_score: 60, mask_urls: ["m"] }] } });
      return new Response("{}", { status: 404 });
    };
    const cfg = readConfig({ YOUCAM_API_KEY: "sk-test", YOUCAM_API_BASE: "https://yc.example" });
    const s = await serve(createHandler(cfg, { youcam: new YouCam({ apiKey: "sk-test", base: cfg.base }, fake) }));
    const r = await (await fetch(s.url + "/api/scan", { method: "POST", body: JSON.stringify({ image: jpeg }) })).json();
    expect(r).toEqual({ mode: "live", skinTask: "S1", toneTask: "T1" });
    expect(JSON.stringify(r)).not.toContain("sk-test");
    const skinCall = calls.find((c) => c.url.endsWith("/task/skin-analysis"))!;
    expect(skinCall.auth).toBe("Bearer sk-test");
    expect(skinCall.body.src_file_id).toBe("F1"); expect(skinCall.body.dst_actions).toHaveLength(8);
    // second scan of the same image reuses the cached upload
    await fetch(s.url + "/api/scan", { method: "POST", body: JSON.stringify({ image: jpeg }) });
    expect(calls.filter((c) => c.url.endsWith("/s2s/v2.0/file"))).toHaveLength(1);
    const p = await (await fetch(s.url + "/api/task?kind=skin&id=S1")).json();
    expect(p).toMatchObject({ status: "success", result: { scores: [{ concern: "acne", score: 70 }] } });
    s.close();
  });
  it("rejects non-image payloads", async () => {
    const s = await serve(createHandler(readConfig({ YOUCAM_API_KEY: "k" }), { youcam: new YouCam({ apiKey: "k", base: "x" }, (async () => new Response("{}")) as any) }));
    const r = await fetch(s.url + "/api/scan", { method: "POST", body: JSON.stringify({ image: "data:text/html;base64,AAAA" }) });
    expect(r.status).toBe(400); s.close();
  });
});

describe("parsers", () => {
  it("parses HD-prefixed skin output and tone colours", () => {
    expect(parseSkin({ output: [{ type: "hd_texture", ui_score: 68.4 }] }).scores[0]).toMatchObject({ concern: "texture", score: 68 });
    expect(parseTone({ color: { skin_color: "#b9947c" } }).skin).toBe("#b9947c");
  });
});
