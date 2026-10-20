// Places each voice clip at its scene offset, adds a quiet synthesized whoosh at each scene change,
// then applies ONE gain change toward -14 LUFS without letting true peak exceed -1 dBTP.
import { execSync } from "node:child_process";
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync("src/timeline.json"));
const END = 8, total = tl.total / tl.fps + END;
execSync(`ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:duration=0.8:seed=7" -af "highpass=f=250,lowpass=f=3500,afade=t=in:d=0.35,afade=t=out:st=0.35:d=0.45,volume=0.12" -ar 48000 -ac 2 out/whoosh.wav`);
const inputs = [], filters = [];
tl.scenes.forEach((s, i) => {
  inputs.push(`-i public/vo/s${i + 1}.mp3`);
  const ms = Math.round(((s.from + s.audioFrom) / tl.fps) * 1000);
  filters.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`);
});
const n = tl.scenes.length;
tl.scenes.forEach((s, i) => {
  if (i === 0) return;
  inputs.push(`-i out/whoosh.wav`);
  const ms = Math.max(0, Math.round((s.from / tl.fps - 0.35) * 1000));
  filters.push(`[${n + i - 1}:a]adelay=${ms}|${ms}[w${i}]`);
});
const labels = [...tl.scenes.map((_, i) => `[v${i}]`), ...tl.scenes.slice(1).map((_, i) => `[w${i + 1}]`)].join("");
filters.push(`${labels}amix=inputs=${labels.split("[").length - 1}:normalize=0:duration=longest,apad=whole_dur=${total}[mix]`);
execSync(`ffmpeg -y -loglevel error ${inputs.join(" ")} -filter_complex "${filters.join(";")}" -map "[mix]" -t ${total} -ar 48000 out/mix_raw.wav`);
const meas = (f) => { const o = execSync(`ffmpeg -hide_banner -nostats -i ${f} -af ebur128=peak=true -f null - 2>&1`).toString(); return { I: +o.match(/I:\s+(-?[\d.]+) LUFS/g).pop().match(/-?[\d.]+/)[0], TP: +o.match(/Peak:\s+(-?[\d.]+) dBFS/g).pop().match(/-?[\d.]+/)[0] }; };
const m = meas("out/mix_raw.wav");
let gain = -14 - m.I;
if (m.TP + gain > -1) gain = -1 - m.TP;
execSync(`ffmpeg -y -loglevel error -i out/mix_raw.wav -af volume=${gain.toFixed(2)}dB -c:a pcm_s24le out/mix.wav`);
const r = meas("out/mix.wav");
console.log(`raw ${m.I} LUFS / ${m.TP} dBTP -> gain ${gain.toFixed(2)} dB -> ${r.I} LUFS / ${r.TP} dBTP`);
