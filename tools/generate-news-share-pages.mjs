import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_ORIGIN = "https://simbayananfoundation.org";
const DEFAULT_SHEET_ID = "1kkdTXbozZH22kmIB0f6L-DD9W8jElHwd0qzVUcd7mu0";
const DEFAULT_NEWS_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=news`;

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
  const url = text.match(/https?:\/\/[^\s)]+|#\/[^^\s)]+/);
  return url ? url[0] : text;
}

function socialImageUrl(value = "") {
  const cleaned = cleanLink(value).replace(/^['"]|['"]$/g, "");
  if (!cleaned) return `${SITE_ORIGIN}/images/carousel/scholars-celebration-2019.jpg`;

  const match = cleaned.match(/drive\.google\.com\/file\/d\/([^/]+)/i)
    || cleaned.match(/drive\.google\.com\/(?:uc|thumbnail|open)\?[^#]*\bid=([^&]+)/i)
    || cleaned.match(/drive\.google\.com\/.*[?&]id=([^&]+)/i)
    || cleaned.match(/docs\.google\.com\/uc\?export=view&id=([^&]+)/i);

  if (match?.[1]) return `https://lh3.googleusercontent.com/d/${encodeURIComponent(match[1])}=w1200`;
  if (cleaned.startsWith("http")) return cleaned;
  return `${SITE_ORIGIN}/${cleaned.replace(/^\/+/, "")}`;
}

function firstBodyImage(body = "") {
  const match = String(body).match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match?.[1] || "";
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

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

async function newsUrlFromConfig() {
  try {
    const config = await readFile("js/content-config.js", "utf8");
    return config.match(/news:\s*"([^"]+)"/)?.[1] || DEFAULT_NEWS_URL;
  } catch {
    return DEFAULT_NEWS_URL;
  }
}

function pageHtml(row) {
  const id = field(row, "ID");
  const title = field(row, "Header") || "SMCFI News";
  const body = field(row, "Body");
  const description = field(row, "Subheader") || stripMarkdown(body).slice(0, 220) || "Stories, announcements, and community updates from SMCFI.";
  const rawImage = field(row, "Card Thumbnail", "CardThumbnail", "ImageURL") || firstBodyImage(body);
  const image = socialImageUrl(rawImage);
  const url = `${SITE_ORIGIN}/news/${encodeURIComponent(id)}/`;
  const appUrl = `/index.html#/news/${encodeURIComponent(id)}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Simbayanan ni Maria Community Foundation, Inc.</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Simbayanan ni Maria Community Foundation, Inc.">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:secure_url" content="${escapeHtml(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${escapeHtml(url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<script>window.location.replace("${appUrl}");</script>
</head>
<body>
<p><a href="${appUrl}">Open ${escapeHtml(title)}</a></p>
</body>
</html>
`;
}

const response = await fetch(await newsUrlFromConfig());
if (!response.ok) throw new Error(`Could not load news sheet: ${response.status}`);

const rows = parseCsv(await response.text())
  .filter((row) => String(field(row, "status")).toLowerCase() === "active" && field(row, "ID"));

await rm("news", { recursive: true, force: true });
await mkdir("news", { recursive: true });

for (const row of rows) {
  const id = field(row, "ID");
  const directory = path.join("news", id);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), pageHtml(row), "utf8");
}

await writeFile(path.join("news", "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>News | Simbayanan ni Maria Community Foundation, Inc.</title>
<script>window.location.replace("/index.html#/news");</script>
</head>
<body><p><a href="/index.html#/news">Open News</a></p></body>
</html>
`, "utf8");

console.log(`Generated ${rows.length} news share page(s).`);
