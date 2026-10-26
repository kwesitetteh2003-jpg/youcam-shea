// The Shea agent: a transparent, deterministic planner.
// observe (YouCam scores + tone) → weigh for deep skin + climate → guard (refuse bleaching, grey-cast SPF)
// → act (pick an AM/PM routine) → style (rank garments against the measured skin colour).
// Every decision is written to `trace`, so the UI can show its reasoning step by step.
import { BLOCKED, CONCERN_LABEL, GARMENTS, PRODUCTS } from "./catalog";
import { chromaOf, contrast, depthOf, hueOf, undertoneOf } from "./color";
import type { Climate, Concern, Garment, GarmentPick, Pick, Plan, Product, Refusal, SkinScore, Step, ToneResult, TraceStep } from "./types";

/** Concerns that weigh more on deep skin: any inflammation can leave marks that last months. */
export const DEEP_WEIGHT: Record<Concern, number> = {
  age_spot: 1.4, acne: 1.25, dark_circle_v2: 1.2, oiliness: 1, texture: 1, pore: 0.85, moisture: 0.9, radiance: 0.8,
};
const WHY: Record<Concern, string> = {
  age_spot: "Marks after breakouts (PIH) linger longest on melanin-rich skin, so this gets the highest weight.",
  acne: "Each breakout can leave a dark mark, so we treat it early.",
  dark_circle_v2: "Under-eye darkness on deep skin is often pigment, not tiredness. We target the pigment.",
  oiliness: "High humidity means more shine, so we use light textures.",
  texture: "Smoothing texture also helps light reflect evenly.",
  pore: "Visible pores often track with oil in hot weather.",
  moisture: "Even oily skin dehydrates under AC and sun.",
  radiance: "Dullness usually lifts once marks and texture are handled.",
};
export const ACCRA: Climate = { city: "Accra", humidity: "high", uv: "very_high" };

export function blockedReason(p: Product): string | undefined {
  for (const ing of p.ingredients) for (const b of BLOCKED) if (b.match.test(ing)) return `${ing}: ${b.reason}`;
}

export function plan(scores: SkinScore[], tone: ToneResult, climate: Climate = ACCRA): Plan {
  const trace: TraceStep[] = [];
  const undertone = undertoneOf(tone.skin), depth = depthOf(tone.skin);
  const deep = depth === "deep" || depth === "medium-deep";
  trace.push({ id: "observe", kind: "observe", title: "Read the scan", detail: `${scores.length} YouCam skin scores. Skin colour ${tone.skin.toUpperCase()} reads as ${depth}, ${undertone} undertone.` });

  // 1. Weigh needs.
  const need = {} as Record<Concern, number>;
  for (const s of scores) {
    let w = deep ? DEEP_WEIGHT[s.concern] : 1;
    if (climate.humidity === "high" && s.concern === "oiliness") w *= 1.15;
    if (climate.humidity === "high" && s.concern === "moisture") w *= 0.85;
    if (climate.uv === "very_high" && s.concern === "age_spot") w *= 1.1;
    need[s.concern] = +(((100 - s.score) / 100) * w).toFixed(3);
  }
  const priorities = scores
    .map((s) => ({ concern: s.concern, label: CONCERN_LABEL[s.concern], weight: need[s.concern] ?? 0, score: s.score, why: WHY[s.concern] }))
    .sort((a, b) => b.weight - a.weight);
  const top = priorities.slice(0, 3);
  trace.push({ id: "weigh", kind: "reason", title: "Weigh for deep skin", detail: `Top priorities: ${top.map((t) => `${t.label} (${t.score}/100)`).join(", ")}. ${deep ? "Scores are re-weighted for melanin-rich skin, where marks outlast spots." : ""}`.trim() });
  trace.push({ id: "climate", kind: "reason", title: `Adjust for ${climate.city}`, detail: `Humidity ${climate.humidity}, UV ${climate.uv.replace("_", " ")}. So we use gel and fluid textures, and daily SPF 50 is non-negotiable.` });

  // 2. Guard: refuse bleaching agents / steroids, and grey-cast SPF on deep skin.
  const refused: Refusal[] = [];
  const allowed = PRODUCTS.filter((p) => {
    const r = blockedReason(p);
    if (r) { refused.push({ product: p, reason: r }); return false; }
    if (deep && p.whiteCast) { refused.push({ product: p, reason: "mineral-only SPF leaves a grey cast on deep skin, so people stop wearing it" }); return false; }
    return true;
  });
  trace.push({ id: "guard", kind: "guard", title: "Safety check", detail: refused.length ? `Refused ${refused.length}. ` + refused.map((r) => `${r.product.name}: ${r.reason}.`).join(" ") : "Nothing refused." });

  // 3. Act: pick one product per step for AM and PM.
  const fit = (p: Product, slot: "am" | "pm") => {
    let s = 0; for (const [c, v] of Object.entries(p.targets)) s += (v ?? 0) * (need[c as Concern] ?? 0);
    if (climate.humidity === "high") { if (p.texture === "gel" || p.texture === "fluid") s += 0.06; if (p.texture === "balm" && slot === "am") s -= 0.2; }
    return s;
  };
  const used = new Set<string>();
  const choose = (step: Step, slot: "am" | "pm"): Pick | undefined => {
    const cands = allowed.filter((p) => p.step === step && p.when.includes(slot));
    const ranked = cands.map((p) => ({ p, s: fit(p, slot) - (used.has(p.id) && step === "treat" ? 0.5 : 0) })).sort((a, b) => b.s - a.s);
    const best = ranked[0]; if (!best) return;
    used.add(best.p.id);
    const hits = Object.entries(best.p.targets).filter(([c]) => (need[c as Concern] ?? 0) > 0.12).sort((a, b) => (b[1] ?? 0) * need[b[0] as Concern] - (a[1] ?? 0) * need[a[0] as Concern]).slice(0, 2).map(([c]) => CONCERN_LABEL[c].toLowerCase().replace("(pih)", "(PIH)"));
    const reason = step === "protect" ? "Daily SPF 50 stops marks from darkening again." + (best.p.note ? " " + best.p.note : "")
      : (hits.length ? `For ${hits.join(" and ")}.` : "Gentle base step.") + (best.p.note ? " " + best.p.note : "");
    return { product: best.p, reason };
  };
  const eyes = (need.dark_circle_v2 ?? 0) > 0.25;
  const am = (["cleanse", "treat", ...(eyes ? ["eye"] : []), "moisturise", "protect"] as Step[]).map((s) => choose(s, "am")).filter(Boolean) as Pick[];
  const pm = (["cleanse", "treat", ...(eyes ? ["eye"] : []), "moisturise"] as Step[]).map((s) => choose(s, "pm")).filter(Boolean) as Pick[];
  trace.push({ id: "routine", kind: "act", title: "Build the routine", detail: `AM: ${am.map((p) => p.product.name).join(" → ")}. PM: ${pm.map((p) => p.product.name).join(" → ")}.` });

  // 4. Style: rank garments by how they sit against the measured skin colour.
  const garments = rankGarments(tone.skin, undertone);
  trace.push({ id: "style", kind: "act", title: "Match colours to skin", detail: `Ranked ${garments.length} pieces against ${tone.skin.toUpperCase()}. Best: ${garments[0].garment.colour} (contrast ${garments[0].contrast.toFixed(1)}:1). Next step: try the top two on with YouCam Clothes VTO.` });

  const ids = new Set<string>(); let totalGhs = 0;
  for (const p of [...am, ...pm]) if (!ids.has(p.product.id)) { ids.add(p.product.id); totalGhs += p.product.priceGhs; }
  const essentials = [am.find((p) => p.product.step === "cleanse"), am.find((p) => p.product.step === "treat"), am.find((p) => p.product.step === "protect")].filter(Boolean) as Pick[];
  const essentialsGhs = essentials.reduce((t, p) => t + p.product.priceGhs, 0);
  return { priorities, undertone, depth, am, pm, refused, garments, trace, totalGhs, essentials, essentialsGhs };
}

export function rankGarments(skin: string, undertone = undertoneOf(skin), list: Garment[] = GARMENTS): GarmentPick[] {
  return list.map((g) => {
    const c = contrast(g.hex, skin), h = hueOf(g.hex), ch = chromaOf(g.hex);
    const warmHue = h <= 95 || h >= 340, coolHue = h >= 150 && h <= 320;
    const harmony = ch < 12 ? 0.6 : undertone === "warm" ? (warmHue ? 1 : coolHue ? 0.55 : 0.75) : undertone === "cool" ? (coolHue ? 1 : warmHue ? 0.55 : 0.75) : 0.8;
    const score = 0.45 * Math.min(c / 6, 1) + 0.35 * harmony + 0.2 * Math.min(ch / 45, 1);
    const bits = [c >= 4 ? "strong contrast frames the face" : c >= 2.2 ? "soft contrast, easy daywear" : "close to skin depth, reads tonal"];
    if (harmony >= 1) bits.push(`sits with a ${undertone} undertone`);
    if (ch >= 30) bits.push("saturated colour holds its own against deep skin");
    return { garment: g, score: +score.toFixed(3), contrast: +c.toFixed(2), reason: bits.join("; ") + "." };
  }).sort((a, b) => b.score - a.score);
}
