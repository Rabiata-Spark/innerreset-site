// Builds the legal pages (/terms/, /privacy/, /privacy/health/ and their /fr/ twins) from the
// Markdown sources kept in the app repository (docs/legal/). Run from the site root:
//   node scripts/build-legal.mjs [--source ../innerreset/docs/legal]
// The Markdown is the legal source of truth; this script only wraps it in the site template.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "./node_modules/marked/lib/marked.esm.js";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const argIndex = process.argv.indexOf("--source");
const source = resolve(argIndex >= 0 ? process.argv[argIndex + 1] : "../innerreset/docs/legal");

const PAGES = [
  { md: "TERMS_OF_SERVICE.md", out: "terms/index.html", lang: "en", slug: "terms",
    title: "Terms of Service — InnerReset",
    description: "The terms that govern the InnerReset app and website: subscriptions, withdrawal, creation credits, your content, AI-generated audio, and your rights as a consumer." },
  { md: "PRIVACY_POLICY.md", out: "privacy/index.html", lang: "en", slug: "privacy",
    title: "Privacy Policy — InnerReset",
    description: "How InnerReset processes personal data: what you share, AI processing, safety routing, subscriptions, storage in the United States, retention, your rights, and deletion." },
  { md: "CONSUMER_HEALTH_PRIVACY.md", out: "consumer-health-data/index.html", lang: "en", slug: "privacy-health",
    title: "Consumer Health Data Privacy Notice — InnerReset",
    description: "InnerReset's notice for consumer health data under the laws of Washington, Nevada and Connecticut: what is collected, why, who receives it, and your rights." },
  { md: "fr/CONDITIONS_GENERALES.md", out: "fr/terms/index.html", lang: "fr", slug: "terms",
    title: "Conditions générales d’utilisation — InnerReset",
    description: "Les conditions qui régissent l’application et le site InnerReset : abonnements, rétractation, crédits de création, vos contenus, l’audio généré par IA et vos droits de consommateur." },
  { md: "fr/POLITIQUE_DE_CONFIDENTIALITE.md", out: "fr/privacy/index.html", lang: "fr", slug: "privacy",
    title: "Politique de confidentialité — InnerReset",
    description: "Comment InnerReset traite les données personnelles : ce que vous partagez, le traitement par IA, le contrôle de sécurité automatisé, les abonnements, l’hébergement aux États-Unis, la conservation, vos droits et la suppression." },
  { md: "fr/AVIS_DONNEES_DE_SANTE.md", out: "fr/consumer-health-data/index.html", lang: "fr", slug: "privacy-health",
    title: "Avis relatif aux données de santé des consommateurs — InnerReset",
    description: "Avis d’InnerReset sur les données de santé des consommateurs au titre des lois de Washington, du Nevada et du Connecticut : collecte, finalités, destinataires et droits." },
];

const NAV = {
  en: [["/", "Home"], ["/terms/", "Terms"], ["/privacy/", "Privacy Policy"], ["/consumer-health-data/", "Health data notice"]],
  fr: [["/", "Accueil"], ["/fr/terms/", "Conditions"], ["/fr/privacy/", "Confidentialité"], ["/fr/consumer-health-data/", "Données de santé"]],
};
const STRINGS = {
  en: { skip: "Skip to content", home: "InnerReset home", footer: "© 2026 Rabiata LLC · InnerReset is not a medical or therapeutic service.", legalNav: "Legal", other: "Version française", tableLabel: "Table" },
  fr: { skip: "Aller au contenu", home: "Accueil InnerReset", footer: "© 2026 Rabiata LLC · InnerReset n’est pas un service médical ni thérapeutique.", legalNav: "Mentions", other: "English version", tableLabel: "Tableau" },
};

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const slugify = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

function render(page) {
  const path = join(source, page.md);
  if (!existsSync(path)) { console.log(`skip ${page.out}: ${page.md} not found`); return; }
  const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
  const lines = raw.split("\n");
  const h1Index = lines.findIndex((l) => l.startsWith("# "));
  const h1 = lines[h1Index].slice(2).trim();
  const body = lines.slice(h1Index + 1);
  // The meta block: consecutive "**Label:** value" lines right after the H1.
  const meta = [];
  let i = 0;
  while (i < body.length && (body[i].trim() === "" || /^\*\*[^*]+:\*\*/.test(body[i].trim()))) {
    if (body[i].trim()) meta.push(body[i].trim());
    i += 1;
  }
  const rest = body.slice(i).join("\n");
  // Split the rest at H2 headings into sections.
  const parts = rest.split(/^(?=## )/m).filter((p) => p.trim());
  const sections = parts.map((part) => {
    const first = part.split("\n")[0];
    const isH2 = first.startsWith("## ");
    const heading = isH2 ? first.slice(3).trim() : null;
    const content = isH2 ? part.split("\n").slice(1).join("\n") : part;
    let html = marked.parse(content, { gfm: true, breaks: false });
    if (page.lang === "fr") html = html.replace(/href="\/(privacy|terms|consumer-health-data)\/"/g, 'href="/fr/$1/"');
    html = html.replace(/<table>/g, `<div class="legal-table-scroll" role="region" aria-label="${STRINGS[page.lang].tableLabel}" tabindex="0"><table class="legal-table">`).replace(/<\/table>/g, "</table></div>");
    if (!heading) return html;
    const id = `${page.slug}-${slugify(heading)}`;
    return `<section aria-labelledby="${id}">\n<h2 id="${id}">${marked.parseInline(heading)}</h2>\n${html}</section>`;
  }).join("\n");
  const metaHtml = meta.map((m) => `<p>${marked.parseInline(m)}</p>`).join("\n");
  const alt = PAGES.find((p) => p.slug === page.slug && p.lang !== page.lang);
  const canonical = `https://innerreset.life/${page.out.replace(/index\.html$/, "")}`;
  const altUrl = alt ? `https://innerreset.life/${alt.out.replace(/index\.html$/, "")}` : null;
  const depth = page.out.split("/").length - 1;
  const up = "../".repeat(depth);
  const s = STRINGS[page.lang];
  const nav = NAV[page.lang].map(([href, label]) => `<a href="${href}">${label}</a>`).join("");
  const html = `<!DOCTYPE html>
<html lang="${page.lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeAttr(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}">
    <meta name="theme-color" content="#050608">
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" hreflang="${page.lang}" href="${canonical}">
${altUrl ? `    <link rel="alternate" hreflang="${alt.lang}" href="${altUrl}">\n    <link rel="alternate" hreflang="x-default" href="https://innerreset.life/${(page.lang === "en" ? page : alt).out.replace(/index\.html$/, "")}">\n` : ""}    <link rel="icon" type="image/png" href="${up}assets/brand/favicon.png">
    <link rel="preload" href="${up}assets/fonts/fraunces-latin-600.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="${up}assets/fonts/inter-latin-400-600.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${up}styles.css">
    <style>.legal-header__inner{justify-content:space-between;gap:1rem}.legal-lang{display:flex;min-height:2.65rem;align-items:center;color:var(--muted);font-size:.85rem;text-decoration:underline;text-underline-offset:.2em}.legal-lang:hover,.legal-lang:focus-visible{color:var(--ink)}</style>
  </head>
  <body class="legal-page">
    <a class="skip-link" href="#main-content">${s.skip}</a>

    <header class="legal-header">
      <div class="shell legal-header__inner">
        <a class="brand" href="/" aria-label="${s.home}">
          <img src="${up}assets/brand/innerreset-mark.png" alt="" width="40" height="38">
          <span>InnerReset</span>
        </a>
        ${altUrl ? `<a class="legal-lang" href="${altUrl.replace("https://innerreset.life", "")}" hreflang="${alt.lang}" lang="${alt.lang}">${s.other}</a>` : ""}
      </div>
    </header>

    <main class="legal-main" id="main-content">
      <article class="legal-prose">
        <h1>${marked.parseInline(h1)}</h1>
        <div class="legal-meta">
${metaHtml}
        </div>

        <div class="legal-content">
${sections}
        </div>
      </article>
    </main>

    <footer class="legal-footer">
      <div class="shell legal-footer__inner">
        <p>${s.footer}</p>
        <nav aria-label="${s.legalNav}">${nav}</nav>
      </div>
    </footer>
  </body>
</html>
`;
  const outPath = join(siteRoot, page.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf8");
  console.log(`wrote ${page.out} (${sections.split("<section").length - 1} sections, ${meta.length} meta lines)`);
}

for (const page of PAGES) render(page);

// Redirects for paths other pages may still use.
const REDIRECTS = [["privacy/health/index.html", "/consumer-health-data/"], ["fr/privacy/health/index.html", "/fr/consumer-health-data/"]];
for (const [out, target] of REDIRECTS) {
  const outPath = join(siteRoot, out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="https://innerreset.life${target}"><title>Redirecting</title></head><body><a href="${target}">${target}</a></body></html>
`, "utf8");
  console.log(`redirect ${out} -> ${target}`);
}
