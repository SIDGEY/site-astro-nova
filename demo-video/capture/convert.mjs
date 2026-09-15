import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, '..', 'output', 'raw');
const CLIPS_DIR = path.join(__dirname, '..', 'output', 'clips');

const manifest = JSON.parse(await readFile(path.join(RAW_DIR, 'manifest.json'), 'utf8'));

for (const [name, { trimStart, trimEnd }] of Object.entries(manifest)) {
  const input = path.join(RAW_DIR, `${name}.webm`);
  const output = path.join(CLIPS_DIR, `${name}.mp4`);
  const duration = (trimEnd - trimStart).toFixed(3);
  console.log(`Converting ${name} (${trimStart.toFixed(2)}s -> ${trimEnd.toFixed(2)}s, ${duration}s)...`);
  await run('ffmpeg', [
    '-y',
    '-ss', trimStart.toFixed(3),
    '-i', input,
    '-t', duration,
    // Playwright records at a fixed 25fps; 50 is an exact 2x so every source
    // frame is shown twice and the scroll keeps an even cadence.
    '-vf', 'fps=50,setpts=PTS-STARTPTS',
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-crf', '16',
    '-preset', 'medium',
    '-pix_fmt', 'yuv420p',
    output,
    '-loglevel', 'error',
  ]);
}

console.log('Done.');
