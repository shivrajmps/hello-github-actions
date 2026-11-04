// node render.js <mode: stills|video> <videoId> <outPath> [fps]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const BUILD = __dirname;
const [mode, videoId, outPath, fpsArg] = process.argv.slice(2);
const FPS = parseInt(fpsArg || '30', 10);
const scripts = JSON.parse(fs.readFileSync(path.join(BUILD, 'scripts.json'), 'utf8'));
const timeline = JSON.parse(fs.readFileSync(path.join(BUILD, '..', 'audio', 'timeline.json'), 'utf8'));
const vdef = scripts.videos.find(v => v.id === videoId);
const vt = timeline.videos.find(v => v.id === videoId);
if (!vdef || !vt) { console.error('unknown video', videoId); process.exit(1); }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(BUILD, 'www', 'board.html'));
  await page.addScriptTag({ path: path.join(BUILD, 'www', 'scenes.js') });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([document.fonts.load('44px Kalam'), document.fonts.load('700 44px Caveat'), document.fonts.load('21px Inter'), document.fonts.load('700 44px Kalam')]));
  const info = await page.evaluate(({ id, vt, label, chapters }) => {
    const r = window.buildVideo(id, vt, label, chapters);
    window.setup(r.items, r.meta);
    window.__caps = r.meta.caps; window.__dur = r.duration;
    return { duration: r.duration, caps: r.meta.caps, nItems: r.items.length };
  }, { id: videoId, vt, label: vdef.label, chapters: vdef.chapters });
  fs.writeFileSync(path.join(BUILD, '..', 'audio', videoId + '.caps.json'), JSON.stringify(info, null, 1));
  console.log(videoId, 'duration', info.duration.toFixed(2), 'items', info.nItems);

  if (mode === 'stills') {
    fs.mkdirSync(outPath, { recursive: true });
    // one still at the end of every sentence cue (everything of that sentence drawn) + a few mid-draw
    const times = [];
    for (const c of info.caps) times.push(Math.min(info.duration - 0.05, c.end + 0.1));
    const uniq = [...new Set(times.map(t => t.toFixed(2)))].map(Number);
    for (let i = 0; i < uniq.length; i++) {
      await page.evaluate(t => window.render(t), uniq[i]);
      await page.screenshot({ path: path.join(outPath, `${videoId}_${String(i).padStart(2, '0')}_${uniq[i].toFixed(1)}s.png`), type: 'png' });
    }
    console.log('stills', uniq.length);
  } else {
    const nFrames = Math.ceil(info.duration * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < nFrames; f++) {
      const t = f / FPS;
      await page.evaluate(t => window.render(t), t);
      const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 300 === 0) console.log(videoId, `${f}/${nFrames}`, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
    console.log(videoId, 'video done', nFrames, 'frames', `${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
