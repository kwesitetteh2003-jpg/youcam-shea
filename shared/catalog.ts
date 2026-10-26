// House-label catalogue (fictional products, no third-party trademarks). Prices in Ghana cedis.
import type { Garment, Product } from "./types";

export const PRODUCTS: Product[] = [
  { id: "gel-cleanser", name: "Calm Gel Cleanser", step: "cleanse", when: ["am", "pm"], texture: "gel", ingredients: ["glycerin", "panthenol", "coco-glucoside"], targets: { oiliness: 0.4, acne: 0.2, pore: 0.2 }, priceGhs: 95, note: "Low-foam, pH 5.5. Won't strip in heat." },
  { id: "bha-cleanser", name: "Clear Pore BHA Wash", step: "cleanse", when: ["pm"], texture: "foam", ingredients: ["salicylic acid 0.5%", "zinc PCA"], targets: { acne: 0.6, pore: 0.5, oiliness: 0.5 }, priceGhs: 110 },
  { id: "cream-cleanser", name: "Milk Cream Cleanser", step: "cleanse", when: ["am", "pm"], texture: "cream", ingredients: ["shea butter", "oat"], targets: { moisture: 0.5 }, priceGhs: 98 },

  { id: "azelaic", name: "Even Tone Azelaic 10%", step: "treat", when: ["am", "pm"], texture: "fluid", ingredients: ["azelaic acid 10%", "niacinamide 2%"], targets: { age_spot: 0.9, acne: 0.6, texture: 0.3 }, priceGhs: 240, note: "Fades post-breakout marks without bleaching. Safe on deep skin." },
  { id: "niacinamide", name: "Niacinamide 5% + Zinc Serum", step: "treat", when: ["am"], texture: "fluid", ingredients: ["niacinamide 5%", "zinc PCA 1%"], targets: { oiliness: 0.7, pore: 0.6, age_spot: 0.5, radiance: 0.3 }, priceGhs: 185 },
  { id: "tranexamic", name: "Tranexamic Mark Fader", step: "treat", when: ["pm"], texture: "fluid", ingredients: ["tranexamic acid 3%", "licorice root"], targets: { age_spot: 0.8, radiance: 0.4 }, priceGhs: 260 },
  { id: "retinal", name: "Slow Retinal 0.05%", step: "treat", when: ["pm"], texture: "cream", ingredients: ["retinaldehyde 0.05%", "ceramides"], targets: { texture: 0.8, pore: 0.4, acne: 0.4, radiance: 0.3 }, priceGhs: 320, note: "Start twice a week; irritation causes marks on deep skin." },
  { id: "vitc", name: "Vitamin C 12% Glow Drops", step: "treat", when: ["am"], texture: "fluid", ingredients: ["ethyl ascorbic acid 12%", "ferulic acid"], targets: { radiance: 0.8, age_spot: 0.4 }, priceGhs: 230 },

  { id: "gel-cream", name: "Humid-Day Gel Cream", step: "moisturise", when: ["am", "pm"], texture: "gel", ingredients: ["glycerin", "hyaluronic acid", "squalane"], targets: { moisture: 0.6, oiliness: 0.2 }, priceGhs: 150 },
  { id: "barrier", name: "Shea Barrier Balm", step: "moisturise", when: ["pm"], texture: "balm", ingredients: ["shea butter", "ceramides", "cholesterol"], targets: { moisture: 0.9, texture: 0.3 }, priceGhs: 170 },

  { id: "spf-fluid", name: "Sheer Fluid SPF 50", step: "protect", when: ["am"], texture: "fluid", ingredients: ["bemotrizinol", "uvinul A plus", "niacinamide"], targets: { age_spot: 0.5, radiance: 0.2 }, priceGhs: 210, note: "Invisible on deep skin, no grey cast." },
  { id: "spf-tinted", name: "Tinted Iron-Oxide SPF 50 (deep)", step: "protect", when: ["am"], texture: "fluid", ingredients: ["zinc oxide", "iron oxides (deep shade)"], targets: { age_spot: 0.6 }, priceGhs: 225, note: "Iron oxides also block visible light, which drives melasma." },
  { id: "spf-mineral", name: "Mineral Shield SPF 50", step: "protect", when: ["am"], texture: "cream", ingredients: ["zinc oxide 20%", "titanium dioxide"], targets: { age_spot: 0.5 }, priceGhs: 150, whiteCast: true },

  { id: "eye-caffeine", name: "Caffeine Eye Fluid", step: "eye", when: ["am"], texture: "fluid", ingredients: ["caffeine 5%", "peptides"], targets: { dark_circle_v2: 0.6 }, priceGhs: 140 },
  { id: "eye-pigment", name: "Under-Eye Brightening Cream", step: "eye", when: ["pm"], texture: "cream", ingredients: ["tranexamic acid 2%", "vitamin K", "ceramides"], targets: { dark_circle_v2: 0.8 }, priceGhs: 165, note: "Targets periorbital pigmentation, common on deep skin." },

  // What a market stall might push. The agent must refuse these.
  { id: "toning-cream", name: "Instant Fair Toning Cream", step: "treat", when: ["am", "pm"], texture: "cream", ingredients: ["hydroquinone 4%", "clobetasol propionate 0.05%"], targets: { age_spot: 1, radiance: 0.9 }, priceGhs: 60 },
  { id: "even-gel", name: "Overnight Even-Out Gel (unlabelled)", step: "treat", when: ["pm"], texture: "gel", ingredients: ["mercurous chloride", "fragrance"], targets: { age_spot: 1 }, priceGhs: 45 },
];

/** Ingredients the agent will never recommend without a prescription: skin-lightening agents and potent steroids. */
export const BLOCKED: { match: RegExp; reason: string }[] = [
  { match: /mercur/i, reason: "mercury is toxic to kidneys and nerves, and Ghana FDA does not permit it in cosmetics" },
  { match: /clobetasol|betamethasone/i, reason: "a potent steroid that thins skin, not permitted in cosmetics by Ghana FDA" },
  { match: /hydroquinone/i, reason: "a bleaching agent, banned in cosmetics in Ghana since 2016, that can cause ochronosis (blue-black darkening)" },
];

export const GARMENTS: Garment[] = [
  { id: "g-linen", name: "Band-collar linen shirt", colour: "Natural linen", hex: "#E7DED0", category: "upper_body", priceGhs: 380, photoBy: "dayong tien" },
  { id: "g-rose-shirt", name: "Boxy cotton tee", colour: "Hibiscus rose", hex: "#D46F74", category: "upper_body", priceGhs: 210, photoBy: "MART PRODUCTION" },
  { id: "g-sage-tee", name: "Heavyweight tee", colour: "Sage", hex: "#A3B39A", category: "upper_body", priceGhs: 190, photoBy: "Ron Lach" },
  { id: "g-olive-shirt", name: "Oxford button-down", colour: "Moss", hex: "#8B977C", category: "upper_body", priceGhs: 340, photoBy: "Ron Lach" },
  { id: "g-floral-dress", name: "Printed slip dress", colour: "Garden print", hex: "#B4473B", category: "full_body", priceGhs: 450, photoBy: "Lisa Fotios" },
];

export const CONCERN_LABEL: Record<string, string> = {
  acne: "Breakouts", age_spot: "Dark marks (PIH)", dark_circle_v2: "Under-eye darkness", oiliness: "Oil & shine",
  moisture: "Hydration", pore: "Pores", texture: "Texture", radiance: "Radiance",
};
