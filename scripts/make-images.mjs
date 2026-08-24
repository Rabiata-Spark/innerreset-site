import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import sharp from "sharp";

const scriptsDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const root = path.resolve(scriptsDir, "..");
const v4MastersDir = path.join(root, ".dev", "art-masters-v4");
const v5MastersDir = path.join(root, ".dev", "art-masters-v5");
const imageDir = path.join(root, "assets", "images");

await mkdir(imageDir, { recursive: true });

const writeModernPair = async (mastersDir, sourceName, outputName, width, options = {}) => {
  const { avifQuality = 58, webpQuality = 86, keyBlack = false, extract } = options;
  const sourcePath = path.join(mastersDir, sourceName);
  let pipeline = sharp(sourcePath);
  if (extract) pipeline = pipeline.extract(extract);
  if (keyBlack) {
    const alphaSource = extract ? sharp(sourcePath).extract(extract) : sharp(sourcePath);
    const alpha = await alphaSource.greyscale().linear(21.25, -85).raw().toBuffer({ resolveWithObject: true });
    const mask = Buffer.alloc(alpha.data.length * 4, 255);
    for (let index = 0; index < alpha.data.length; index += 1) mask[index * 4 + 3] = alpha.data[index];
    pipeline = pipeline.ensureAlpha().composite([{
      input: mask,
      raw: { width: alpha.info.width, height: alpha.info.height, channels: 4 },
      blend: "dest-in"
    }]);
  }
  pipeline = pipeline.resize({ width, withoutEnlargement: true });
  const avifPath = path.join(imageDir, `${outputName}.avif`);
  const webpPath = path.join(imageDir, `${outputName}.webp`);
  await Promise.all([
    pipeline.clone().avif({ quality: avifQuality, effort: 7 }).toFile(avifPath),
    pipeline.clone().webp({ quality: webpQuality, effort: 6 }).toFile(webpPath)
  ]);
  const outputs = await Promise.all([sharp(avifPath).metadata(), sharp(webpPath).metadata()]);
  if (outputs.some((metadata) => metadata.width !== width)) {
    throw new Error(`${outputName} did not render at its required ${width}px width.`);
  }
};

await Promise.all([
  writeModernPair(v4MastersDir, "card_field_amber.png", "card-field-amber", 720),
  writeModernPair(v4MastersDir, "card_field_violet.png", "card-field-violet", 720),
  writeModernPair(v4MastersDir, "human_moment.png", "human-moment-800", 800, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair(v4MastersDir, "human_moment.png", "human-moment-1400", 1400, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair(v4MastersDir, "mock_wtc_recording.png", "mock-wtc-recording", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair(v4MastersDir, "mock_carry_player.png", "mock-carry-player", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair(v4MastersDir, "mock_carries_library.png", "mock-carries-library", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair(v4MastersDir, "mock_amtb_approval.png", "mock-amtb-approval", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair(v4MastersDir, "mock_mindtrack_player.png", "mock-mindtrack-player", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair(v4MastersDir, "mock_mindtracks_library.png", "mock-mindtracks-library", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair(v5MastersDir, "woven_threads.png", "woven-threads", 896, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair(v5MastersDir, "ember_keepsake.png", "ember-keepsake", 896, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair(v5MastersDir, "growth_horizon.png", "growth-horizon", 2048, { avifQuality: 61, webpQuality: 88 }),
  writeModernPair(v5MastersDir, "artifact_field_dawn.png", "artifact-field-dawn", 1024, { avifQuality: 62, webpQuality: 89 }),
  writeModernPair(v5MastersDir, "artifact_field_nebula.png", "artifact-field-nebula", 640, { avifQuality: 60, webpQuality: 87 }),
  writeModernPair(v5MastersDir, "artifact_field_sea.png", "artifact-field-sea", 640, { avifQuality: 60, webpQuality: 87 }),
  writeModernPair(v5MastersDir, "constellation_dust.png", "constellation-dust", 1024),
  writeModernPair(v4MastersDir, "mock_wtc_recording.png", "step-input-detail", 864, {
    avifQuality: 64,
    webpQuality: 90,
    extract: { left: 129, top: 610, width: 864, height: 420 }
  }),
  writeModernPair(v4MastersDir, "mock_amtb_approval.png", "step-approval-detail", 864, {
    avifQuality: 64,
    webpQuality: 90,
    extract: { left: 129, top: 430, width: 864, height: 620 }
  }),
  writeModernPair(v4MastersDir, "mock_carry_player.png", "step-player-detail", 864, {
    avifQuality: 64,
    webpQuality: 90,
    extract: { left: 129, top: 210, width: 864, height: 630 }
  }),
  writeModernPair(v4MastersDir, "mock_mindtracks_library.png", "step-library-detail", 864, {
    avifQuality: 64,
    webpQuality: 90,
    extract: { left: 129, top: 210, width: 864, height: 680 }
  })
]);

const retired = [
  "move-reveal-rings.avif", "move-reveal-rings.webp",
  "move-carry-rings.avif", "move-carry-rings.webp",
  "contemplative-woman-800.avif", "contemplative-woman-800.webp",
  "contemplative-woman-1400.avif", "contemplative-woman-1400.webp",
  "move-03-motif.avif", "move-03-motif.webp",
  "move-04-motif.avif", "move-04-motif.webp"
];
await Promise.all(retired.map((name) => rm(path.join(imageDir, name), { force: true })));

console.log("Created v5 stills, four real-UI detail crops, existing survivors, and removed retired ring derivatives.");
