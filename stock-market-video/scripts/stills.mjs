import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync("src/timeline.json"));
const frames = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : tl.scenes.flatMap(s => s.phrases.filter((_, i) => i % 2 === 1).map(p => s.from + p.end - 3));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const composition = await selectComposition({ serveUrl, id: "StockMarket", browserExecutable });
fs.mkdirSync("out/stills", { recursive: true });
for (const frame of frames) {
  await renderStill({ serveUrl, composition, frame, output: `out/stills/f${String(frame).padStart(5, "0")}.png`, browserExecutable });
}
console.log("rendered", frames.length);
