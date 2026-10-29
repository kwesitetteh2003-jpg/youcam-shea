import { describe, expect, it } from "vitest";
import { plan, rankGarments, blockedReason } from "../shared/agent";
import { PRODUCTS } from "../shared/catalog";
import { DEMO_SKIN, DEMO_TONE } from "../shared/fixtures";
import { depthOf, undertoneOf, contrast } from "../shared/color";

describe("colour", () => {
  it("reads the demo tone (YouCam's reading of the sample) as deep and warm", () => {
    expect(depthOf(DEMO_TONE.skin)).toBe("deep");
    expect(undertoneOf(DEMO_TONE.skin)).toBe("warm");
    expect(undertoneOf("#5B3522")).toBe("neutral");
    expect(undertoneOf("#c68642")).toBe("warm");
    expect(depthOf("#F1D3C2")).toBe("light");
  });
  it("contrast is symmetric and >= 1", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrast("#5B3522", "#E7DED0")).toBeCloseTo(contrast("#E7DED0", "#5B3522"));
  });
});

describe("agent", () => {
  const p = plan(DEMO_SKIN.scores, DEMO_TONE);
  it("puts dark marks first for deep skin", () => { expect(p.priorities[0].concern).toBe("age_spot"); });
  it("refuses bleaching agents, steroids, mercury and grey-cast SPF", () => {
    const ids = p.refused.map((r) => r.product.id).sort();
    expect(ids).toEqual(["even-gel", "spf-mineral", "toning-cream"]);
    for (const pick of [...p.am, ...p.pm]) expect(blockedReason(pick.product)).toBeUndefined();
  });
  it("always includes SPF in the morning and never a balm in humid AM", () => {
    expect(p.am.some((x) => x.product.step === "protect")).toBe(true);
    expect(p.am.some((x) => x.product.texture === "balm")).toBe(false);
  });
  it("does not use the same treatment AM and PM", () => {
    const am = p.am.find((x) => x.product.step === "treat")!.product.id, pm = p.pm.find((x) => x.product.step === "treat")!.product.id;
    expect(am).not.toBe(pm);
  });
  it("leaves mineral SPF allowed on light skin", () => {
    const light = plan(DEMO_SKIN.scores, { skin: "#F1D3C2" });
    expect(light.refused.map((r) => r.product.id)).not.toContain("spf-mineral");
  });
  it("writes a trace with a guard step", () => {
    expect(p.trace.map((t) => t.id)).toEqual(["observe", "weigh", "climate", "guard", "routine", "style"]);
    expect(p.totalGhs).toBeGreaterThan(0);
  });
  it("ranks garments deterministically and every product is in the catalogue", () => {
    const r = rankGarments(DEMO_TONE.skin);
    expect(r).toHaveLength(5); expect(r[0].score).toBeGreaterThanOrEqual(r[4].score);
    for (const x of [...p.am, ...p.pm]) expect(PRODUCTS).toContain(x.product);
  });
});
