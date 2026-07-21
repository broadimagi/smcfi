import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_ORIGIN = "https://simbayananfoundation.org";
const SITE_NAME = "Simbayanan ni Maria Community Foundation, Inc.";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/images/carousel/scholars-celebration-2019.jpg`;
const PUBLIC_DIR = "public";
const DEFAULT_SHEET_ID = "1kkdTXbozZH22kmIB0f6L-DD9W8jElHwd0qzVUcd7mu0";
const DEFAULT_SHEET_URLS = {
  news: `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=news`,
  projects: `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=projects`,
};

const routes = [
  {
    path: "/",
    route: "home",
    title: SITE_NAME,
    description: "Scholarship, formation, and community service in Taguig City.",
  },
  {
    path: "/about/",
    route: "about",
    title: `About | ${SITE_NAME}`,
    description: "Learn about the mission, vision, history, and certifications of Simbayanan ni Maria Community Foundation, Inc.",
  },
  {
    path: "/scholarship/",
    route: "scholarship",
    title: `Scholarship and Formation | ${SITE_NAME}`,
    description: "Educational support, values formation, leadership development, and community engagement for deserving youth.",
  },
  {
    path: "/projects/",
    route: "projects",
    title: `Projects | ${SITE_NAME}`,
    description: "Programs, campaigns, and initiatives supporting youth transformation in Taguig City.",
  },
  {
    path: "/news/",
    route: "news",
    title: `News | ${SITE_NAME}`,
    description: "Stories, announcements, and community updates from Simbayanan ni Maria Community Foundation, Inc.",
  },
  {
    path: "/contact/",
    route: "contact",
    title: `Contact | ${SITE_NAME}`,
    description: "Contact Simbayanan ni Maria Community Foundation, Inc. for partnerships, donations, and scholarship inquiries.",
  },
];

const projectPages = [
  {
    path: "/projects/201/",
    route: "projects/201",
    title: `1st SMCFI Grand Alumni Homecoming and Sportfest | ${SITE_NAME}`,
    description: "Once a scholar, always part of the mission",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
  },
  {
    path: "/projects/202/",
    route: "projects/202",
    title: `35th Anniversary Souvenir Program | ${SITE_NAME}`,
    description: "A page of gratitude, a future of hope",
    image: "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcRofKIag6AcK1tzA3wVxiPDApGC1wVCOq4NEqNI3tOifyc2fDTzRjw2JxHG-fRUwiU5YNPIVnF5NZggpV0",
  },
  {
    path: "/projects/education-run/",
    route: "projects/education-run",
    title: `SMCFI 35th Education Run | ${SITE_NAME}`,
    description: "A fundraising initiative for scholarship support.",
    image: `${SITE_ORIGIN}/images/carousel/outdoor-scholar-community.jpg`,
  },
  {
    path: "/projects/scholarship-program/",
    route: "projects/scholarship-program",
    title: `Scholarship Program | ${SITE_NAME}`,
    description: "Holistic support for poor but deserving youth.",
    image: `${SITE_ORIGIN}/images/carousel/scholars-christmas-gathering.jpg`,
  },
  {
    path: "/projects/alumni-engagement/",
    route: "projects/alumni-engagement",
    title: `Alumni Engagement | ${SITE_NAME}`,
    description: "Graduates helping sustain the mission.",
    image: `${SITE_ORIGIN}/images/carousel/slep-community-group.jpg`,
  },
  {
    path: "/projects/204/",
    route: "projects/204",
    title: `1st SMCFI Grand Alumni Homecoming | ${SITE_NAME}`,
    description: "Once a scholar, always part of the mission.",
    image: `${SITE_ORIGIN}/images/carousel/slep-community-group.jpg`,
  },
  {
    path: "/projects/205/",
    route: "projects/205",
    title: `Movie Premiere Fundraising Event | ${SITE_NAME}`,
    description: "One ticket. One cause. One step closer to a scholar's dream",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
  },
  {
    path: "/projects/206/",
    route: "projects/206",
    title: `35th Anniversary: Education Run | ${SITE_NAME}`,
    description: "Every stride is an act of love for a scholar's education",
    image: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=800",
  },
];

const fallbackNewsPages = [
  {
    path: "/news/35-years/",
    route: "news/35-years",
    title: `SMCFI Celebrates 35 Years of Community Service | ${SITE_NAME}`,
    description: "A continuing mission of scholarship, values formation, and servant leadership.",
    image: `${SITE_ORIGIN}/images/carousel/scholars-celebration-2019.jpg`,
  },
  {
    path: "/news/scholar-gathering/",
    route: "news/scholar-gathering",
    title: `Scholars Gather for Formation and Fellowship | ${SITE_NAME}`,
    description: "Young leaders continue building confidence, service, and community.",
    image: `${SITE_ORIGIN}/images/carousel/slep-community-group.jpg`,
  },
];

const legacyNewsPages = [
  {
    path: "/news/101/",
    route: "news/101",
    title: `SMCFI Celebrates 35th Anniversary | ${SITE_NAME}`,
    description: "From our humble beginnings as Simbayanan ni Maria, your unwavering support has fueled our mission to uplift the underserved.",
    image: "https://lh3.googleusercontent.com/d/1u03WT-3OBEChF6Suc_7Yajsf7L-KDFnT=w1200",
    type: "article",
  },
  {
    path: "/news/102/",
    route: "news/102",
    title: `SMCFI Alumni Homecoming 2026 | ${SITE_NAME}`,
    description: "Nostalgia and warm embraces as alumni from Batches 1989 to 2026 gathered for a historic Alumni Homecoming.",
    image: "https://lh3.googleusercontent.com/d/1vRaWuGDX2EIoUmkGMXfg6PCQtb9R_ckF=w1200",
    type: "article",
  },
  {
    path: "/news/103/",
    route: "news/103",
    title: `Baliklaro Alumni and Scholars Sportfest 2026 | ${SITE_NAME}`,
    description: "The celebration of SMCFI's 35th Anniversary moved from the function halls to the hardcourt.",
    image: "https://lh3.googleusercontent.com/d/1ltR_0L-b_aLMEpFX6e4l1li7nYufxYPu=w1200",
    type: "article",
  },
];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeKey(key = "") {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function field(row, ...keys) {
  for (const key of keys) {
    const direct = row[key];
    if (direct !== undefined && direct !== "") return direct;
    const normalized = row[normalizeKey(key)];
    if (normalized !== undefined && normalized !== "") return normalized;
  }
  return "";
}

function cleanLink(value = "") {
  const text = String(value).trim();
  const imageFunction = text.match(/=?\s*IMAGE\(\s*["']([^"']+)["']\s*\)/i);
  if (imageFunction) return imageFunction[1].trim();
  const markdownLink = text.match(/\[[^\]]+\]\(([^)]+)\)/);
  if (markdownLink) return markdownLink[1].trim();
  const url = text.match(/https?:\/\/[^\s)]+|\/[^\s)]+/);
  return url ? url[0] : text;
}

function firstBodyImage(body = "") {
  return String(body).match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] || "";
}

function stripMarkdown(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function socialImageUrl(value = "") {
  const cleaned = cleanLink(value).replace(/^['"]|['"]$/g, "");
  if (!cleaned) return DEFAULT_IMAGE;

  const match = cleaned.match(/drive\.google\.com\/file\/d\/([^/]+)/i)
    || cleaned.match(/drive\.google\.com\/(?:uc|thumbnail|open)\?[^#]*\bid=([^&]+)/i)
    || cleaned.match(/drive\.google\.com\/.*[?&]id=([^&]+)/i)
    || cleaned.match(/docs\.google\.com\/uc\?export=view&id=([^&]+)/i);

  if (match?.[1]) return `https://lh3.googleusercontent.com/d/${encodeURIComponent(match[1])}=w1200`;
  if (cleaned.startsWith("http")) return cleaned;
  return `${SITE_ORIGIN}/${cleaned.replace(/^\/+/, "")}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((item) => item.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((item) => item.trim())) rows.push(row);
  const headers = rows.shift()?.map((item) => item.trim()) || [];
  return rows.map((cells) => headers.reduce((record, header, index) => {
    const value = (cells[index] || "").trim();
    record[header] = value;
    record[normalizeKey(header)] = value;
    return record;
  }, {}));
}

function absoluteUrl(routePath = "/") {
  return `${SITE_ORIGIN}${routePath === "/" ? "/" : routePath}`;
}

async function sheetUrlsFromConfig() {
  try {
    const config = await readFile("js/content-config.js", "utf8");
    return {
      news: config.match(/news:\s*"([^"]+)"/)?.[1] || DEFAULT_SHEET_URLS.news,
      projects: config.match(/projects:\s*"([^"]+)"/)?.[1] || DEFAULT_SHEET_URLS.projects,
    };
  } catch {
    return DEFAULT_SHEET_URLS;
  }
}

async function sheetPages(type) {
  const urls = await sheetUrlsFromConfig();
  try {
    const response = await fetch(urls[type]);
    if (!response.ok) throw new Error(`${type} sheet returned ${response.status}`);
    return parseCsv(await response.text())
      .filter((row) => String(field(row, "status")).toLowerCase() === "active" && field(row, "ID"))
      .map((row) => {
        const id = field(row, "ID");
        const body = field(row, "Body");
        const title = field(row, "Header") || `${type} ${id}`;
        const description = field(row, "Subheader") || stripMarkdown(body).slice(0, 220) || "Simbayanan ni Maria Community Foundation, Inc.";
        const rawImage = field(row, "Card Thumbnail", "CardThumbnail", "ImageURL") || firstBodyImage(body);
        return {
          path: `/${type}/${encodeURIComponent(id)}/`,
          route: `${type}/${id}`,
          title: `${title} | ${SITE_NAME}`,
          description,
          image: socialImageUrl(rawImage),
          type: type === "news" ? "article" : "website",
        };
      });
  } catch {
    return [];
  }
}

function routeToPath(route = "home") {
  if (route === "home") return "/";
  return `/${route.replace(/^\/+|\/+$/g, "")}/`;
}

function pageHtml({ title, description, image = DEFAULT_IMAGE, path: routePath = "/", type = "website" }) {
  const canonical = absoluteUrl(routePath);
  const appRoute = routePath === "/" ? "home" : routePath.replace(/^\/+|\/+$/g, "");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:secure_url" content="${escapeHtml(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NGO",
    name: SITE_NAME,
    url: SITE_ORIGIN,
    areaServed: "Taguig City, Philippines",
    description,
    image,
  })}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
<link href="/css/app.css" rel="stylesheet">
</head>
<body>
<div id="root"></div>
<noscript>
  <main class="section">
    <article class="section-inner detail-card">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p><a href="${escapeHtml(canonical)}">${escapeHtml(canonical)}</a></p>
    </article>
  </main>
</noscript>
<script>window.SMCFI_INITIAL_ROUTE = ${JSON.stringify(appRoute)};</script>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="/js/content-config.js"></script>
<script type="text/babel" src="/js/app.jsx"></script>
</body>
</html>
`;
}

async function writePage(page) {
  const routePath = page.path || routeToPath(page.route);
  const outputDir = path.join(PUBLIC_DIR, routePath.replace(/^\/+|\/+$/g, ""));
  const targetDir = routePath === "/" ? PUBLIC_DIR : outputDir;
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, "index.html"), pageHtml({ ...page, path: routePath }), "utf8");
}

async function main() {
  await rm(PUBLIC_DIR, { recursive: true, force: true });
  await mkdir(PUBLIC_DIR, { recursive: true });
  await mkdir(path.join(PUBLIC_DIR, "css"), { recursive: true });
  await mkdir(path.join(PUBLIC_DIR, "js"), { recursive: true });

  await cp("images", path.join(PUBLIC_DIR, "images"), { recursive: true });
  await cp("css/app.css", path.join(PUBLIC_DIR, "css", "app.css"));
  await cp("js/app.jsx", path.join(PUBLIC_DIR, "js", "app.jsx"));
  await cp("js/content-config.js", path.join(PUBLIC_DIR, "js", "content-config.js"));

  const sheetNewsPages = await sheetPages("news");
  const sheetProjectPages = await sheetPages("projects");
  const newsPages = [...sheetNewsPages, ...fallbackNewsPages, ...legacyNewsPages];
  const allPages = [...routes, ...sheetProjectPages, ...projectPages, ...newsPages];
  const seenPaths = new Set();

  for (const page of allPages) {
    if (seenPaths.has(page.path)) continue;
    seenPaths.add(page.path);
    await writePage(page);
  }

  await writeFile(path.join(PUBLIC_DIR, "404.html"), pageHtml({
    path: "/404.html",
    route: "home",
    title: `Page Not Found | ${SITE_NAME}`,
    description: "The page could not be found. Open the Simbayanan ni Maria Community Foundation, Inc. website.",
  }), "utf8");

  await writeFile(path.join(PUBLIC_DIR, "robots.txt"), `User-agent: *
Allow: /
Sitemap: ${SITE_ORIGIN}/sitemap.xml
`, "utf8");

  await writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...seenPaths].map((routePath) => `  <url><loc>${absoluteUrl(routePath)}</loc></url>`).join("\n")}
</urlset>
`, "utf8");

  console.log(`Firebase public folder ready with ${seenPaths.size} indexed page(s).`);
}

await main();
