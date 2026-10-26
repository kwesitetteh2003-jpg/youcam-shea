// Resize credited Pexels originals into self-hosted webp (and jpg inputs for the YouCam API).
// One-off helper: run `npm i --no-save sharp` first.
import sharp from "sharp";
import fs from "node:fs";
const SRC = process.argv[2] ?? "/tmp/orig";
const names = fs.readdirSync(SRC).filter((f) => f.endsWith(".jpg")).map((f) => f.replace(".jpg", ""));
const colors = {};
for (const n of names) {
  const img = sharp(`${SRC}/${n}.jpg`).rotate();
  const widths = n.startsWith("g-") ? [480, 960] : [640, 1080, 1600];
  for (const w of widths) await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`public/photos/${n}-${w}.webp`);
  if (n.startsWith("g-") || n === "face" || n === "body")
    await img.clone().resize({ width: 1280, height: 1280, fit: "inside" }).jpeg({ quality: 86 }).toFile(`public/src/${n}.jpg`);
  if (n.startsWith("g-")) {
    const m = await img.metadata();
    const s = await img.clone().extract({ left: Math.round(m.width * 0.38), top: Math.round(m.height * 0.42), width: Math.round(m.width * 0.24), height: Math.round(m.height * 0.2) }).stats();
    colors[n] = "#" + s.channels.slice(0, 3).map((c) => Math.round(c.mean).toString(16).padStart(2, "0")).join("");
  }
}
console.log(JSON.stringify(colors));
