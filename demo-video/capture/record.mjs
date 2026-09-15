import { chromium } from 'playwright';
import { mkdir, rename, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, '..', 'output', 'raw');
const MANIFEST_PATH = path.join(RAW_DIR, 'manifest.json');
const BASE_URL = 'http://localhost:4322';
const VIEWPORT = { width: 1600, height: 1000 };

await mkdir(RAW_DIR, { recursive: true });

// The site sets `scroll-behavior: smooth` on <html>; left enabled, every
// per-frame scrollTo() restarts a native smooth-scroll animation and the page
// stutters and snaps backwards instead of following the curve.
const CAPTURE_CSS = `
  html, body, * { scroll-behavior: auto !important; }
  * { scrollbar-width: none !important; }
  *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
`;

// [from, to] scroll offsets in px, duration of the scroll in ms
const SCENES = [
  { name: '01-hero',     url: '/', from: 0,    to: 1750, duration: 5200 },
  { name: '02-block3d',  url: '/', from: 1700, to: 2750, duration: 4600 },
  { name: '03-features', url: '/', from: 2716, to: 4250, duration: 6200 },
  { name: '04-carousel', url: '/', from: 4900, to: 5850, duration: 4600 },
  { name: '05-blog',     url: '/blog', from: 0, to: 2200, duration: 4800 },
  { name: '06-article',  url: '/blog/dynasty-nova-ce-qui-change-pour-un-joueur-habitue-a-ogame', from: 0, to: 2600, duration: 5800 },
];

// Trapezoidal velocity profile: sinusoidal ramp up over the first `r` of the
// time, constant speed in the middle, mirrored ramp down. Reads like a human
// scrolling steadily, unlike ease-in-out curves that crawl at both ends.
function easeScroll(t, r = 0.22) {
  const area = 1 - r;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < r) {
    return (0.5 * (t - (r / Math.PI) * Math.sin((Math.PI * t) / r))) / area;
  }
  if (t <= 1 - r) {
    return (0.5 * r + (t - r)) / area;
  }
  const u = t - (1 - r);
  return (1 - 1.5 * r + 0.5 * (u + (r / Math.PI) * Math.sin((Math.PI * u) / r))) / area;
}

async function smoothScrollTo(page, from, to, duration) {
  await page.evaluate(
    ({ from, to, duration, easingSrc }) => {
      // eslint-disable-next-line no-eval
      const ease = eval(`(${easingSrc})`);
      return new Promise((resolve) => {
        const start = performance.now();
        function step(now) {
          const t = Math.min((now - start) / duration, 1);
          window.scrollTo({ top: from + (to - from) * ease(t), behavior: 'instant' });
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    },
    { from, to, duration, easingSrc: easeScroll.toString() },
  );
}

const browser = await chromium.launch();
const manifest = {};

for (const scene of SCENES) {
  console.log(`Capturing ${scene.name} ...`);
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: { dir: RAW_DIR, size: VIEWPORT },
    colorScheme: 'dark',
  });
  const tContextStart = Date.now();
  const page = await context.newPage();
  await page.addStyleTag({ content: CAPTURE_CSS });
  await page.goto(BASE_URL + scene.url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: CAPTURE_CSS });
  // Let webfonts / lazy images / entrance animations settle.
  await page.waitForTimeout(500);

  // Warm-up pass over the scene's range: triggers lazy images and one-shot
  // scroll-reveal animations so nothing pops in mid-shot during the real take.
  await page.evaluate(
    async ({ from, to, viewportHeight }) => {
      const step = viewportHeight / 2;
      for (let y = from; y <= to + viewportHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 90));
      }
    },
    { from: scene.from, to: scene.to, viewportHeight: VIEWPORT.height },
  );
  await page.waitForLoadState('networkidle');

  // Back to the scene's start offset (captured, but trimmed away below).
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scene.from);
  await page.waitForTimeout(900);

  const tScrollStart = Date.now();
  await smoothScrollTo(page, scene.from, scene.to, scene.duration);
  const tScrollEnd = Date.now();

  const video = page.video();
  await context.close();
  const videoPath = await video.path();
  const target = path.join(RAW_DIR, `${scene.name}.webm`);
  await rename(videoPath, target);

  manifest[scene.name] = {
    trimStart: (tScrollStart - tContextStart) / 1000,
    trimEnd: (tScrollEnd - tContextStart) / 1000,
  };
  console.log(`  -> ${target} [${manifest[scene.name].trimStart.toFixed(2)}s - ${manifest[scene.name].trimEnd.toFixed(2)}s]`);
}

await browser.close();
await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

// Clean up any leftover files playwright drops in RAW_DIR that aren't ours.
const files = await readdir(RAW_DIR);
for (const f of files) {
  if (!SCENES.some((s) => f.startsWith(s.name)) && f !== 'manifest.json') {
    console.log('note: leftover file', f);
  }
}

console.log('Done.');
