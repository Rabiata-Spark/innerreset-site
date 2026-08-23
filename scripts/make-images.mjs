import path from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import sharp from "sharp";

const scriptsDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const root = path.resolve(scriptsDir, "..");
const mastersDir = path.join(root, ".dev", "art-masters");
const imageDir = path.join(root, "assets", "images");
const screenDir = path.join(root, "assets", "screens");
const optimizedScreenDir = path.join(screenDir, "optimized");
const ogDir = path.join(root, "assets", "og");

await Promise.all([
  mkdir(imageDir, { recursive: true }),
  mkdir(optimizedScreenDir, { recursive: true }),
  mkdir(ogDir, { recursive: true })
]);

const writeModernPair = async (pipeline, basePath, options = {}) => {
  const { avifQuality = 54, webpQuality = 84 } = options;
  await Promise.all([
    pipeline.clone().avif({ quality: avifQuality, effort: 7 }).toFile(`${basePath}.avif`),
    pipeline.clone().webp({ quality: webpQuality, effort: 6 }).toFile(`${basePath}.webp`)
  ]);
};

const womanSource = path.join(mastersDir, "contemplative_woman_beneath_a_cosmic_halo.png");
for (const width of [800, 1400]) {
  await writeModernPair(
    sharp(womanSource).resize({ width, withoutEnlargement: true }),
    path.join(imageDir, `contemplative-woman-${width}`),
    { avifQuality: 58, webpQuality: 86 }
  );
}

const boardSource = path.join(mastersDir, "a_reset_in_four_moves.png");
const boardMeta = await sharp(boardSource).metadata();
if (boardMeta.width !== 1672 || boardMeta.height !== 941) {
  throw new Error(`Unexpected four-moves board size: ${boardMeta.width}x${boardMeta.height}`);
}

// The board is four equal 418px columns. Motifs 03 and 04 sit inside the upper
// 60% of their columns. These centered 350px squares exclude both number and copy.
const columnWidth = boardMeta.width / 4;
const motifSize = 350;
const motifTop = 210;
for (const columnIndex of [2, 3]) {
  const columnLeft = columnIndex * columnWidth;
  const left = Math.round(columnLeft + (columnWidth - motifSize) / 2);
  const crop = { left, top: motifTop, width: motifSize, height: motifSize };
  if (crop.top + crop.height > boardMeta.height * 0.6) {
    throw new Error(`Motif crop ${columnIndex + 1} extends below the upper 60% bounds.`);
  }
  await writeModernPair(
    sharp(boardSource).extract(crop),
    path.join(imageDir, `move-${String(columnIndex + 1).padStart(2, "0")}-motif`),
    { avifQuality: 60, webpQuality: 88 }
  );
}

const screenshots = (await readdir(screenDir))
  .filter((name) => name.endsWith(".png"))
  .sort();

for (const name of screenshots) {
  const source = path.join(screenDir, name);
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 393 || metadata.height !== 852) {
    throw new Error(`Protected screenshot ${name} has unexpected dimensions ${metadata.width}x${metadata.height}.`);
  }
  const baseName = path.basename(name, ".png");
  // 393px is exactly 2x the largest 196.5px CSS rendering. At 3x DPR the
  // stylesheet caps these images at 131px, preserving a 1:1 device-pixel ratio.
  const resized = sharp(source);
  await writeModernPair(resized, path.join(optimizedScreenDir, baseName), {
    avifQuality: 58,
    webpQuality: 86
  });
}

const portalSource = path.join(mastersDir, "luminous_cosmic_ripple_portal.png");
const portal = await sharp(portalSource)
  .resize(470, 470, { fit: "contain" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: "#050608"
  }
})
  .composite([{ input: portal, left: 365, top: 80, blend: "screen" }])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(ogDir, "og-card.png"));

console.log(`Created responsive art, ${screenshots.length} screenshot pairs, and the 1200x630 OG card.`);
