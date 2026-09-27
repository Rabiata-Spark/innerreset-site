import sharp from 'sharp';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run from any directory; optionally pass the app repository as the first argument.
const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.resolve(process.argv.slice(2).find(value => !value.startsWith('--')) || path.join(site, '../innerreset'));
const catalog = 'ios/InnerReset/Assets.xcassets';
const relative = p => path.relative(site, p).split(path.sep).join('/');
const hash = data => createHash('sha256').update(data).digest('hex');
// Refresh provenance after prompt metadata embedding without re-encoding any artwork.
if (process.argv.includes('--refresh-manifest')) {
  const manifestPath = path.join(site, 'assets/living-page/manifest.json');
  const existing = JSON.parse(await readFile(manifestPath, 'utf8'));
  const prompts = '.impeccable/production/2026-09-27/prompts.json';
  const promptsExist = await access(path.join(site, prompts)).then(() => true, () => false);
  for (const asset of [...existing.produce, ...existing.direct]) {
    asset.source_sha256 = hash(await readFile(path.resolve(site, asset.source_crop)));
    const output = await readFile(path.resolve(site, asset.output_path));
    asset.output_sha256 = hash(output);
    asset.bytes = output.length;
  }
  if (promptsExist) for (const asset of existing.produce) {
    asset.prompt_reference = prompts;
    asset.prompt_storage = `${asset.output_path}.json`;
    asset.prompt_storage_note = 'WebP is unsupported by embed-prompt metadata embedding; prompt is preserved in the adjacent JSON sidecar and source PNG metadata.';
  }
  await writeFile(manifestPath, `${JSON.stringify(existing, null, 2)}\n`);
  console.log('Manifest provenance refreshed; image bytes unchanged.');
  process.exit(0);
}
const direct = [];
const produce = [];

async function convert(id, source, resize, destination = `assets/living-page/${id}.webp`, sourceRoot = app) {
  const input = path.join(sourceRoot, source);
  const output = path.join(site, destination);
  await mkdir(path.dirname(output), { recursive: true });
  const original = await sharp(input).metadata();
  let pipeline = sharp(input).resize({ ...resize, fit: 'inside', withoutEnlargement: true });
  pipeline = destination.endsWith('.png') ? pipeline.png() : pipeline.webp({ quality: 88, alphaQuality: 100, effort: 6 });
  const result = await pipeline.toFile(output);
  const metadata = await sharp(output).metadata();
  if (metadata.width > original.width || metadata.height > original.height || metadata.hasAlpha !== original.hasAlpha) {
    throw new Error(`Asset invariant failed: ${id}`);
  }
  direct.push({ id, source_crop: relative(input), source_sha256: hash(await readFile(input)),
    output_path: destination, output_sha256: hash(await readFile(output)),
    strategy: 'Aspect-preserving downscale and compression only; no crop, recolor or artwork edits.',
    source_dimensions: [original.width, original.height], dimensions: [metadata.width, metadata.height],
    format: metadata.format, transparency: metadata.hasAlpha, bytes: result.size,
    deviations: [], qa_status: 'needs_parent_review' });
}

async function exactCopy(source, destination) {
  const input = path.join(app, source);
  const output = path.join(site, destination);
  await mkdir(path.dirname(output), { recursive: true });
  await copyFile(input, output);
  const data = await readFile(output);
  direct.push({ id: path.basename(destination), source_crop: relative(input), source_sha256: hash(await readFile(input)),
    output_path: destination, output_sha256: hash(data), strategy: 'Exact byte-for-byte copy of approved app source.',
    format: path.extname(destination).slice(1), bytes: data.length, deviations: [], qa_status: 'accepted' });
}

for (const [id, folder, file] of [
  ['tiamat-thinking', 'LPHeroMind', 'light.png'],
  ['tiamat-listening', 'LPHeroListen', 'dark.png'],
]) {
  const source = `${catalog}/${folder}.imageset/${file}`;
  await convert(id, source, { width: 1000, height: 1000 });
  await convert(`${id}-600`, source, { width: 600 });
}
for (const theme of ['light', 'dark']) {
  await convert(`page-${theme}`, `${catalog}/LPPaintPage.imageset/${theme}.png`, { width: 1024 });
}
for (const color of ['Amber', 'Violet', 'Ivory']) {
  await convert(`paint-${color.toLowerCase()}`, `${catalog}/LPPaint${color}.imageset/LPPaint${color}.png`, { width: 900 });
}
for (const [id, source] of [['speak', 'LPExpressionSpeak'], ['shape', 'LPExpressionWrite'], ['listen', 'LPExpressionVoice'], ['keep', 'LPPaintBook']]) {
  await convert(`step-${id}`, `${catalog}/${source}.imageset/${source}.png`, { width: 160, height: 160 });
}
await exactCopy(`${catalog}/BrandMark.imageset/BrandMark.png`, 'assets/brand/innerreset-mark.png');
await convert('favicon', `${catalog}/BrandMark.imageset/BrandMark.png`, { width: 64, height: 64 }, 'assets/brand/favicon.png');
for (const file of ['Cinzel-Medium.ttf', 'Cinzel-OFL.txt']) {
  await exactCopy(`ios/InnerReset/Resources/Fonts/${file}`, `assets/fonts/${file}`);
}

// Generated masters stay outside shipping assets. Never synthesize or mask pixels here.
const promptReference = '.impeccable/production/2026-09-27/prompts.json';
const hasPrompts = await access(path.join(site, promptReference)).then(() => true, () => false);
for (const [name, sourceFile] of [['hoshi-offering', 'hoshi-offering-clean.png'], ['hoshi-listening', 'hoshi-listening.png']]) {
  const source = `.impeccable/production/2026-09-27/${sourceFile}`;
  if (!await access(path.join(site, source)).then(() => true, () => false)) continue;
  for (const width of [1000, 600]) {
    const id = width === 1000 ? name : `${name}-600`;
    await convert(id, source, { width }, `assets/living-page/${id}.webp`, site);
    const asset = direct.pop();
    produce.push({ ...asset, strategy: 'Parent-generated ChatGPT source; direct aspect-preserving resize/compression after paper-background alpha inspection.',
      ...(hasPrompts ? { prompt_reference: promptReference, prompt_storage: `${asset.output_path}.json`,
        prompt_storage_note: 'WebP is unsupported by embed-prompt metadata embedding; prompt is preserved in the adjacent JSON sidecar and source PNG metadata.' } : {}),
      qa_status: 'accepted', qa_notes: name === 'hoshi-offering'
        ? 'Source and outputs inspected on #F7F0E6; parent verified canvas identity. No background halo or manual pixel cleanup.'
        : 'Source and outputs inspected on #F7F0E6 and #221C24. No background halo or manual pixel cleanup.' });
    if (hasPrompts) {
      const prompts = JSON.parse(await readFile(path.join(site, promptReference), 'utf8'));
      await writeFile(path.join(site, `${asset.output_path}.json`), `${JSON.stringify({ prompt: prompts[sourceFile], prompt_reference: promptReference }, null, 2)}\n`);
    }
  }
}

const manifest = {
  approved_reference: '.impeccable/mocks/2026-09-27/B-two-ways.png',
  produce, direct,
  semantic: [
    { id: 'typography', implementation: 'Use semantic h1/h2/h3 and paragraphs; @font-face Cinzel Medium for display headings and existing Inter for body. Keep copy selectable and responsive.', notes: 'No raster lettering.', qa_status: 'needs_parent_review' },
    { id: 'controls', implementation: 'Use native links, buttons and form controls with visible focus states; CSS places decorative paint textures behind live text and owns sizing and hit areas.', notes: 'No baked buttons or labels.', qa_status: 'needs_parent_review' },
    { id: 'composition', implementation: 'CSS grid places approved character img elements beside live copy; use object-fit: contain and intrinsic aspect ratios. Responsive layout stacks columns. CSS owns page color, spacing and paint background placement.', notes: 'Do not crop silhouettes or stretch transparent textures.', qa_status: 'needs_parent_review' },
  ],
  execution_order: ['Convert existing approved app assets', 'Parent visually validates all outputs', 'Parent supplies and validates new Hoshi source assets separately'],
  blockers: [],
  assumptions: ['Only build-consumed imagery belongs in this directory.', 'Small expression glyphs remain at native 96px resolution.', 'Tiamat offering is omitted until a consuming component requires it.', 'New male artwork generation is owned by the parent.'],
};
await writeFile(path.join(site, 'assets/living-page/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify([...produce, ...direct].map(({ output_path, dimensions, bytes }) => ({ output_path, dimensions, bytes })), null, 2));
