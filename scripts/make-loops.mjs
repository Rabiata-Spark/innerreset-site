import path from "node:path";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const scriptsDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const root = path.resolve(scriptsDir, "..");
const motionMastersDir = path.join(root, ".dev", "motion-masters-v4");
const outputDir = path.join(root, "assets", "motion");
const temporaryDir = path.join(outputDir, ".pipeline-tmp");
const fadeDuration = 0.72;
const xfadeDuration = 0.678;
const crush = "lutrgb=r='if(lt(val\\,16)\\,0\\,val)':g='if(lt(val\\,16)\\,0\\,val)':b='if(lt(val\\,16)\\,0\\,val)'";

const videoClips = [
  { id: "m1-hero-mark", budget: 6 * 1024 * 1024 },
  { id: "m2-voice-halo", budget: 4 * 1024 * 1024 },
  { id: "m3-transform-emblem", budget: 4 * 1024 * 1024 },
  { id: "m4-divider-wave", budget: 4 * 1024 * 1024 },
  { id: "m5-mind-crystal", budget: 4 * 1024 * 1024 }
];

const replacedPrefixes = [
  "m1-ripple-portal",
  "m2-golden-ring",
  "m3-nebula-emblem",
  "m4-lightwave"
];

await mkdir(temporaryDir, { recursive: true });

const run = (args, label) => {
  const result = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${label} failed.\n${result.stderr}`);
  return result;
};

const probe = (input) => {
  const result = spawnSync(ffmpegPath, ["-hide_banner", "-i", input], {
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024
  });
  const durationMatch = result.stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  const videoMatch = result.stderr.match(/Video:.*?,\s(?:[^,]+,\s)?(\d{3,5})x(\d{3,5})/);
  if (!durationMatch || !videoMatch) throw new Error(`Could not read metadata for ${input}.`);
  return {
    duration: Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]),
    width: Number(videoMatch[1]),
    height: Number(videoMatch[2])
  };
};

const encodeWithinBudget = async ({ input, output, codec, initialCrf, maxCrf, budget, label }) => {
  for (let crf = initialCrf; crf <= maxCrf; crf += 2) {
    const common = ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-an"];
    const args = codec === "vp9"
      ? [...common, "-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0", "-row-mt", "1", "-tile-columns", "2", "-cpu-used", "4", "-deadline", "good", "-pix_fmt", "yuv420p", output]
      : [...common, "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output];
    run(args, `${label} CRF ${crf}`);
    const bytes = (await stat(output)).size;
    if (bytes <= budget) return { bytes, crf };
  }
  throw new Error(`${label} cannot meet its ${Math.round(budget / 1024 / 1024)}MB budget at native resolution.`);
};

const writePosterSet = async (pngPath, id) => {
  const posterBase = path.join(outputDir, `${id}-poster`);
  await Promise.all([
    sharp(pngPath).avif({ quality: 54, effort: 7 }).toFile(`${posterBase}.avif`),
    sharp(pngPath).webp({ quality: 84, effort: 6 }).toFile(`${posterBase}.webp`),
    sharp(pngPath).jpeg({ quality: 88, progressive: true, mozjpeg: true }).toFile(`${posterBase}.jpg`)
  ]);
  return {
    avif: `${id}-poster.avif`,
    webp: `${id}-poster.webp`,
    jpg: `${id}-poster.jpg`
  };
};

const manifest = {
  version: 4,
  seam: { method: `${xfadeDuration}s tail-to-head xfade over a 0.72s seam window`, outputDuration: "source minus 0.72s" },
  processing: { blackCrush: "RGB values below 16 set to 0 before delivery encode" },
  clips: {}
};

try {
  for (const clip of videoClips) {
    const input = path.join(motionMastersDir, `${clip.id}.mp4`);
    const source = probe(input);
    if (source.duration <= fadeDuration * 3) throw new Error(`${clip.id} is too short to loop safely.`);

    const bodyEnd = source.duration - fadeDuration;
    const filter = [
      `[0:v]fps=24,split=3[body0][tail0][head0]`,
      `[body0]trim=start=${fadeDuration}:end=${bodyEnd},setpts=PTS-STARTPTS[body]`,
      `[tail0]trim=start=${bodyEnd}:end=${source.duration},setpts=PTS-STARTPTS[tail]`,
      `[head0]trim=start=0:end=${fadeDuration},setpts=PTS-STARTPTS[head]`,
      `[tail][head]xfade=transition=fade:duration=${xfadeDuration}:offset=0,setpts=PTS-STARTPTS[seam]`,
      `[body][seam]concat=n=2:v=1:a=0,${crush},format=yuv420p[outv]`
    ].join(";");

    const mezzanine = path.join(temporaryDir, `${clip.id}-loop.mp4`);
    run([
      "-y", "-hide_banner", "-loglevel", "error", "-i", input,
      "-filter_complex", filter, "-map", "[outv]", "-an",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "0", "-pix_fmt", "yuv420p",
      mezzanine
    ], `${clip.id} seam crossfade and black crush`);

    const webmName = `${clip.id}.webm`;
    const mp4Name = `${clip.id}.mp4`;
    const webm = await encodeWithinBudget({
      input: mezzanine,
      output: path.join(outputDir, webmName),
      codec: "vp9",
      initialCrf: 33,
      maxCrf: 49,
      budget: clip.budget,
      label: `${clip.id} VP9`
    });
    const mp4 = await encodeWithinBudget({
      input: mezzanine,
      output: path.join(outputDir, mp4Name),
      codec: "h264",
      initialCrf: 23,
      maxCrf: 39,
      budget: clip.budget,
      label: `${clip.id} H.264`
    });

    const posterPng = path.join(temporaryDir, `${clip.id}-poster.png`);
    run(["-y", "-hide_banner", "-loglevel", "error", "-i", mezzanine, "-frames:v", "1", posterPng], `${clip.id} processed poster extraction`);
    const poster = await writePosterSet(posterPng, clip.id);

    manifest.clips[clip.id] = {
      webm: webmName,
      mp4: mp4Name,
      poster,
      width: source.width,
      height: source.height,
      duration: Number((source.duration - fadeDuration).toFixed(2)),
      crossfadeSeconds: xfadeDuration,
      encoding: { vp9Crf: webm.crf, h264Crf: mp4.crf }
    };
    console.log(`${clip.id}: ${source.width}x${source.height}, ${manifest.clips[clip.id].duration}s, VP9 CRF ${webm.crf}, H.264 CRF ${mp4.crf}`);
  }

  const oldFiles = (await readdir(outputDir)).filter((name) =>
    replacedPrefixes.some((prefix) => name.startsWith(prefix))
  );
  await Promise.all(oldFiles.map((name) => rm(path.join(outputDir, name), { force: true })));
  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}

console.log("Created five native-resolution v4 loops, processed-frame posters, and manifest v4.");
