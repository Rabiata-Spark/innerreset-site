import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import sharp from "sharp";

const scriptsDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const root = path.resolve(scriptsDir, "..");
const mastersDir = path.join(root, ".dev", "art-masters-v4");
const imageDir = path.join(root, "assets", "images");

await mkdir(imageDir, { recursive: true });

const writeModernPair = async (sourceName, outputName, width, options = {}) => {
  const { avifQuality = 58, webpQuality = 86, keyBlack = false } = options;
  const sourcePath = path.join(mastersDir, sourceName);
  let pipeline = sharp(sourcePath);
  if (keyBlack) {
    const alpha = await sharp(sourcePath).greyscale().linear(21.25, -85).raw().toBuffer({ resolveWithObject: true });
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
  writeModernPair("move_reveal_rings.png", "move-reveal-rings", 720, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair("move_carry_rings.png", "move-carry-rings", 720, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair("card_field_amber.png", "card-field-amber", 720),
  writeModernPair("card_field_violet.png", "card-field-violet", 720),
  writeModernPair("human_moment.png", "human-moment-800", 800, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair("human_moment.png", "human-moment-1400", 1400, { avifQuality: 60, webpQuality: 88 }),
  writeModernPair("mock_wtc_recording.png", "mock-wtc-recording", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair("mock_carry_player.png", "mock-carry-player", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair("mock_carries_library.png", "mock-carries-library", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair("mock_amtb_approval.png", "mock-amtb-approval", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair("mock_mindtrack_player.png", "mock-mindtrack-player", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true }),
  writeModernPair("mock_mindtracks_library.png", "mock-mindtracks-library", 1122, { avifQuality: 62, webpQuality: 88, keyBlack: true })
]);

const replaced = [
  "contemplative-woman-800.avif", "contemplative-woman-800.webp",
  "contemplative-woman-1400.avif", "contemplative-woman-1400.webp",
  "move-03-motif.avif", "move-03-motif.webp",
  "move-04-motif.avif", "move-04-motif.webp"
];
await Promise.all(replaced.map((name) => rm(path.join(imageDir, name), { force: true })));

console.log("Created v4 derivatives for two move motifs, two card fields, the human moment, and six phone mockups.");
