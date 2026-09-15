import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = path.join(__dirname, '..', 'output', 'frames');
const CLIPS_DIR = path.join(__dirname, '..', 'output', 'clips');
const BASE_URL = 'http://localhost:4322';
const VIEWPORT = { width: 1600, height: 1000 };
const FPS = 50;

// The site sets `scroll-behavior: smooth` on <html>; left enabled, every
// scrollTo() restarts a native smooth-scroll animation and the page lands
// somewhere behind the position we asked for.
const CAPTURE_CSS = `
  html, body, * { scroll-behavior: auto !important; }
  * { scrollbar-width: none !important; }
  *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
`;

// Frames are rendered one by one, so the page clock has to advance one frame
// at a time too — otherwise rAF-driven motion (the WebGL planet, the
// countdown) runs at wall-clock speed between shots and plays back 5-10x fast.
function virtualClock() {
  const realNow = performance.now.bind(performance);
  const state = { manual: false, virtual: 0 };
  window.__clock = state;
  window.__advance = (dt) => {
    state.virtual += dt;
  };
  window.__goManual = () => {
    state.virtual = realNow();
    state.manual = true;
  };
  const now = () => (state.manual ? state.virtual : realNow());
  performance.now = now;
  const epoch = Date.now() - realNow();
  Date.now = () => Math.round(epoch + now());
  const origRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => origRaf(() => cb(now()));
}

// [from, to] scroll offsets in px, duration of the scroll in ms
const SCENES = [
  { name: '01-hero', url: '/', from: 0, to: 1750, duration: 5200 },
  { name: '02-block3d', url: '/', from: 1700, to: 2750, duration: 4600 },
  { name: '03-features', url: '/', from: 2716, to: 4250, duration: 6200 },
  { name: '04-carousel', url: '/', from: 4900, to: 5850, duration: 4600 },
  { name: '05-blog', url: '/blog', from: 0, to: 2200, duration: 4800 },
  {
    name: '06-article',
    url: '/blog/dynasty-nova-ce-qui-change-pour-un-joueur-habitue-a-ogame',
    from: 0,
    to: 2600,
    duration: 5800,
  },
];

// Trapezoidal velocity profile: sinusoidal ramp up over the first `r` of the
// time, constant speed in the middle, mirrored ramp down. Reads like a human
// scrolling steadily, unlike ease-in-out curves that crawl at both ends.
function easeScroll(t, r = 0.22) {
  const area = 1 - r;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < r) return (0.5 * (t - (r / Math.PI) * Math.sin((Math.PI * t) / r))) / area;
  if (t <= 1 - r) return (0.5 * r + (t - r)) / area;
  const u = t - (1 - r);
  return (1 - 1.5 * r + 0.5 * (u + (r / Math.PI) * Math.sin((Math.PI * u) / r))) / area;
}

await mkdir(CLIPS_DIR, { recursive: true });
const browser = await chromium.launch();

for (const scene of SCENES) {
  const started = Date.now();
  const frameDir = path.join(FRAMES_DIR, scene.name);
  await rm(frameDir, { recursive: true, force: true });
  await mkdir(frameDir, { recursive: true });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    // Rendering at 2x costs ~4.6x per frame for no visible gain: the clip is
    // displayed at 1400px wide in the composition, below this 1600px capture.
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.addInitScript(virtualClock);
  await page.goto(BASE_URL + scene.url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: CAPTURE_CSS });
  await page.waitForTimeout(500);

  // Warm-up pass over the scene's range: triggers lazy images and one-shot
  // scroll-reveal animations so nothing pops in mid-shot during the real take.
  await page.evaluate(
    async ({ from, to, viewportHeight }) => {
      for (let y = from; y <= to + viewportHeight; y += viewportHeight / 2) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 110));
      }
    },
    { from: scene.from, to: scene.to, viewportHeight: VIEWPORT.height },
  );
  await page.waitForLoadState('networkidle');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scene.from);
  await page.waitForTimeout(900);

  // CSS animations run on the compositor clock, which the virtual clock cannot
  // reach; freeze them so ambient loops hold still instead of strobing.
  const cdp = await context.newCDPSession(page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 });
  await page.evaluate(() => window.__goManual());

  const frames = Math.round((scene.duration / 1000) * FPS);
  const step = 1000 / FPS;
  for (let i = 0; i < frames; i++) {
    const y = scene.from + (scene.to - scene.from) * easeScroll(i / (frames - 1));
    await page.evaluate(
      ({ y, step }) => {
        window.scrollTo({ top: y, behavior: 'instant' });
        window.__advance(step);
      },
      { y, step },
    );
    await page.screenshot({
      path: path.join(frameDir, `${String(i).padStart(5, '0')}.jpg`),
      type: 'jpeg',
      quality: 94,
    });
  }
  await context.close();

  const output = path.join(CLIPS_DIR, `${scene.name}.mp4`);
  await run('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(frameDir, '%05d.jpg'),
    '-vf', `scale=${VIEWPORT.width}:${VIEWPORT.height}:flags=lanczos`,
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-crf', '16',
    '-preset', 'medium',
    '-pix_fmt', 'yuv420p',
    output,
    '-loglevel', 'error',
  ]);
  await rm(frameDir, { recursive: true, force: true });

  const secs = ((Date.now() - started) / 1000).toFixed(0);
  console.log(`${scene.name}: ${frames} frames @ ${FPS}fps -> ${output} (${secs}s)`);
}

await browser.close();
console.log('Done.');
