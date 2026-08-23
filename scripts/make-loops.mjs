import path from "node:path";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const scriptsDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const root = path.resolve(scriptsDir, "..");
const mastersDir = path.join(root, ".dev", "motion-masters");
const outputDir = path.join(root, "assets", "motion");
const temporaryDir = path.join(outputDir, ".pipeline-tmp");
const fadeDuration = 0.72;

const clips = [
  { id: "m1-ripple-portal", target: "1080:1080", budget: 6 * 1024 * 1024 },
  { id: "m2-golden-ring", target: "1080:1080", budget: 4 * 1024 * 1024 },
  { id: "m3-nebula-emblem", target: "1080:1080", budget: 4 * 1024 * 1024 },
  { id: "m4-lightwave", target: "1920:640", budget: 4 * 1024 * 1024, cropLightwave: true }
];

await mkdir(temporaryDir, { recursive: true });

const run = (args, label) => {
  const result = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`${label} failed.\n${result.stderr}`);
  }
  return result;
};

const probeDuration = (input) => {
  const result = spawnSync(ffmpegPath, ["-hide_banner", "-i", input], {
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024
  });
  const match = result.stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Could not read duration for ${input}.`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
};

const encodeWithinBudget = async ({ input, output, codec, initialCrf, maxCrf, budget, label }) => {
  for (let crf = initialCrf; crf <= maxCrf; crf += 2) {
    const common = ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-an"];
    const args = codec === "vp9"
      ? [...common, "-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0", "-row-mt", "1", "-cpu-used", "3", "-deadline", "good", "-pix_fmt", "yuv420p", output]
      : [...common, "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output];
    run(args, `${label} CRF ${crf}`);
    const bytes = (await stat(output)).size;
    if (bytes <= budget) return { bytes, crf };
  }
  throw new Error(`${label} cannot meet its ${Math.round(budget / 1024 / 1024)}MB budget without exceeding the permitted quality range.`);
};

const manifest = { version: 2, seam: { method: "0.72s tail-to-head xfade", outputDuration: "source minus 0.72s" }, clips: {} };

try {
  for (const clip of clips) {
    const input = path.join(mastersDir, `${clip.id}.mp4`);
    const sourceDuration = probeDuration(input);
    if (sourceDuration <= fadeDuration * 3) throw new Error(`${clip.id} is too short to loop safely.`);

    const bodyEnd = sourceDuration - fadeDuration;
    const crop = clip.cropLightwave ? "crop=trunc(iw/6)*6:trunc(iw/6)*2:0:(ih-trunc(iw/6)*2)/2," : "";
    const filter = [
      `[0:v]${crop}scale=${clip.target}:flags=lanczos,fps=24,format=yuv420p,split=3[body0][tail0][head0]`,
      `[body0]trim=start=${fadeDuration}:end=${bodyEnd},setpts=PTS-STARTPTS[body]`,
      `[tail0]trim=start=${bodyEnd}:end=${sourceDuration},setpts=PTS-STARTPTS[tail]`,
      `[head0]trim=start=0:end=${fadeDuration},setpts=PTS-STARTPTS[head]`,
      `[tail][head]xfade=transition=fade:duration=${fadeDuration}:offset=0,setpts=PTS-STARTPTS[seam]`,
      "[body][seam]concat=n=2:v=1:a=0[outv]"
    ].join(";");

    const mezzanine = path.join(temporaryDir, `${clip.id}-loop.mp4`);
    run([
      "-y", "-hide_banner", "-loglevel", "error", "-i", input,
      "-filter_complex", filter, "-map", "[outv]", "-an",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "10", "-pix_fmt", "yuv420p",
      mezzanine
    ], `${clip.id} seam crossfade`);

    const webmName = `${clip.id}.webm`;
    const mp4Name = `${clip.id}.mp4`;
    const webm = await encodeWithinBudget({
      input: mezzanine,
      output: path.join(outputDir, webmName),
      codec: "vp9",
      initialCrf: 33,
      maxCrf: 41,
      budget: clip.budget,
      label: `${clip.id} VP9`
    });
    const mp4 = await encodeWithinBudget({
      input: mezzanine,
      output: path.join(outputDir, mp4Name),
      codec: "h264",
      initialCrf: 23,
      maxCrf: 29,
      budget: clip.budget,
      label: `${clip.id} H.264`
    });

    const posterPng = path.join(temporaryDir, `${clip.id}-poster.png`);
    run(["-y", "-hide_banner", "-loglevel", "error", "-i", mezzanine, "-frames:v", "1", posterPng], `${clip.id} poster extraction`);
    const posterBase = path.join(outputDir, `${clip.id}-poster`);
    await Promise.all([
      sharp(posterPng).avif({ quality: 52, effort: 7 }).toFile(`${posterBase}.avif`),
      sharp(posterPng).webp({ quality: 82, effort: 6 }).toFile(`${posterBase}.webp`),
      sharp(posterPng).jpeg({ quality: 86, progressive: true, mozjpeg: true }).toFile(`${posterBase}.jpg`)
    ]);

    manifest.clips[clip.id] = {
      webm: webmName,
      mp4: mp4Name,
      poster: {
        avif: `${clip.id}-poster.avif`,
        webp: `${clip.id}-poster.webp`,
        jpg: `${clip.id}-poster.jpg`
      },
      width: Number(clip.target.split(":")[0]),
      height: Number(clip.target.split(":")[1]),
      duration: Number((sourceDuration - fadeDuration).toFixed(2)),
      crossfadeSeconds: fadeDuration,
      encoding: { vp9Crf: webm.crf, h264Crf: mp4.crf }
    };
    console.log(`${clip.id}: ${manifest.clips[clip.id].duration}s, VP9 CRF ${webm.crf}, H.264 CRF ${mp4.crf}`);
    await rm(mezzanine, { force: true });
  }

  const oldFiles = (await readdir(outputDir)).filter((name) => name.startsWith("ir-"));
  await Promise.all(oldFiles.map((name) => rm(path.join(outputDir, name), { force: true })));

  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}

console.log("Created four seamless dual-format loops, responsive posters, and manifest v2.");
