// Builds src/timeline.json: per-scene duration + caption phrase timings,
// snapping phrase boundaries to real pauses found by ffmpeg silencedetect.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const FPS = 30, LEAD = 0.25, TAIL = 0.55;
const scenes = JSON.parse(fs.readFileSync(new URL("./scenes.json", import.meta.url)));
const out = [];
let cursor = 0;
for (const [i, sc] of scenes.entries()) {
  const file = `public/vo/s${i + 1}.mp3`;
  const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
  const res = (() => { try { return execFileSync("sh", ["-c", `ffmpeg -i ${file} -af silencedetect=noise=-38dB:d=0.09 -f null - 2>&1`]).toString(); } catch (e) { return e.stdout.toString(); } })();
  const sil = [];
  let s0 = null;
  for (const l of res.split("\n")) {
    const a = l.match(/silence_start: ([\d.]+)/); if (a) s0 = +a[1];
    const b = l.match(/silence_end: ([\d.]+)/); if (b && s0 !== null) { sil.push([s0, +b[1]]); s0 = null; }
  }
  if (s0 !== null) sil.push([s0, dur]);
  const speechStart = sil.length && sil[0][0] < 0.05 ? sil[0][1] : 0;
  const speechEnd = sil.length && Math.abs(sil.at(-1)[1] - dur) < 0.05 ? sil.at(-1)[0] : dur;
  const pauses = sil.filter(([a, b]) => a > speechStart + 0.05 && b < speechEnd - 0.05).map(([a, b]) => ({ a, b, m: (a + b) / 2, used: false }));
  const weights = sc.phrases.map(p => (p[1] ?? p[0]).length + 4);
  const total = weights.reduce((x, y) => x + y, 0);
  const bounds = [speechStart];
  let acc = 0;
  for (let k = 0; k < weights.length - 1; k++) {
    acc += weights[k];
    const guess = speechStart + (acc / total) * (speechEnd - speechStart);
    const prev = bounds.at(-1);
    const cand = pauses.filter(p => !p.used && p.a > prev + 0.3 && Math.abs(p.m - guess) < 0.9).sort((x, y) => Math.abs(x.m - guess) - Math.abs(y.m - guess))[0];
    if (cand) { cand.used = true; bounds.push(cand.b - 0.04); } else bounds.push(Math.max(guess, prev + 0.3));
  }
  bounds.push(speechEnd);
  const phrases = sc.phrases.map((p, k) => ({
    text: p[0],
    start: Math.round((LEAD + bounds[k]) * FPS),
    end: Math.round((LEAD + bounds[k + 1]) * FPS),
  }));
  const frames = Math.ceil((LEAD + dur + TAIL) * FPS);
  out.push({ id: sc.id, chapter: sc.chapter, audio: `vo/s${i + 1}.mp3`, audioFrom: Math.round(LEAD * FPS), from: cursor, frames, phrases, snapped: pauses.filter(p => p.used).length, needed: weights.length - 1 });
  cursor += frames;
}
fs.writeFileSync("src/timeline.json", JSON.stringify({ fps: FPS, total: cursor, scenes: out }, null, 1));
for (const s of out) console.log(s.id, (s.frames / FPS).toFixed(1) + "s", `snapped ${s.snapped}/${s.needed}`, "starts", (s.from / FPS).toFixed(1));
console.log("TOTAL", (cursor / FPS).toFixed(1) + "s");
