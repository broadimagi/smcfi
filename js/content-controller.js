(function () {
  const config = window.SMCFI_CONTENT_CONFIG || {};
  const csvLinks = config.csv || {};

  const getValue = (row, key) => row[key] || row[key.replace(/\s+/g, "")] || "";
  const isActive = (row) => String(getValue(row, "status")).toLowerCase() === "active";
  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const parseCsv = (text) => {
    const rows = [];
    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"' && insideQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell);
        if (row.some((item) => item.trim() !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    row.push(cell);
    if (row.some((item) => item.trim() !== "")) rows.push(row);
    const headers = rows.shift()?.map((item) => item.trim()) || [];

    return rows.map((cells) => headers.reduce((record, header, index) => {
      record[header] = (cells[index] || "").trim();
      return record;
    }, {}));
  };

  const fetchRows = async (key) => {
    const url = csvLinks[key];
    if (!url) return [];
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load ${key} content.`);
    return parseCsv(await response.text());
  };

  const markdownToHtml = (markdown) => {
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    return String(markdown || "")
      .split(/\n{2,}/)
      .map((block) => {
        const withImages = escapeHtml(block).replace(imagePattern, '<img src="$2" alt="$1" class="content-image">');
        return withImages.startsWith("<img") ? withImages : `<p>${withImages.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");
  };

  const renderOpening = async () => {
    const rows = (await fetchRows("opening")).filter(isActive);
    const row = rows[0];
    if (!row) return;

    const imageSettings = getValue(row, "ImageSettings");
    const imageUrl = getValue(row, "ImageURL");
    const buttonText = getValue(row, "ButtonText");
    const buttonLink = getValue(row, "ButtonLink");
    const modal = document.createElement("div");
    modal.className = `opening-modal ${imageSettings === "Background" ? "opening-modal-bg" : ""}`;

    if (imageSettings === "Background" && imageUrl) {
      modal.style.backgroundImage = `linear-gradient(rgba(15,23,42,.72), rgba(15,23,42,.72)), url("${imageUrl}")`;
    }

    modal.innerHTML = `
      <div class="opening-card ${imageSettings === "Image Only" ? "image-only" : ""}">
        <button type="button" class="opening-close" aria-label="Close announcement">&times;</button>
        ${imageUrl && imageSettings !== "Background" ? `<img src="${escapeHtml(imageUrl)}" alt="" class="opening-image">` : ""}
        ${imageSettings !== "Image Only" ? `
          <div class="opening-body">
            <p class="eyebrow">${escapeHtml(getValue(row, "Subheader"))}</p>
            <h2>${escapeHtml(getValue(row, "Header"))}</h2>
            ${markdownToHtml(getValue(row, "Body"))}
            ${buttonText && buttonLink ? `<a href="${escapeHtml(buttonLink)}" class="btn">${escapeHtml(buttonText)}</a>` : ""}
          </div>
        ` : ""}
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".opening-close").addEventListener("click", () => modal.remove());
  };

  const rowId = (row) => getValue(row, "ID") || getValue(row, "Id") || getValue(row, "id");
  const currentId = () => new URLSearchParams(window.location.search).get("id") || window.location.hash.replace(/^#\/?/, "");

  const renderCards = (rows, type) => rows.map((row) => {
    const id = rowId(row);
    const href = `${type}.html?id=${encodeURIComponent(id)}`;
    const thumbnail = getValue(row, "CardThumbnail") || getValue(row, "ImageURL");
    return `
      <article class="content-card">
        ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="" class="content-card-image">` : ""}
        <div class="content-card-body">
          <h3>${escapeHtml(getValue(row, "Header"))}</h3>
          <p>${escapeHtml(getValue(row, "Subheader"))}</p>
          <a href="${href}" class="btn">${type === "projects" ? "View Details" : "Read More"}</a>
        </div>
      </article>
    `;
  }).join("");

  const renderDetail = (row, type) => {
    const byline = type === "news"
      ? `<p class="content-byline">By ${escapeHtml(getValue(row, "PublishedBy"))} on ${escapeHtml(getValue(row, "Date"))}</p>`
      : "";
    const button1 = getValue(row, "Button1Text") && getValue(row, "Button1Link")
      ? `<a href="${escapeHtml(getValue(row, "Button1Link"))}" class="btn">${escapeHtml(getValue(row, "Button1Text"))}</a>`
      : "";
    const button2 = getValue(row, "Button2Text") && getValue(row, "Button2Link")
      ? `<a href="${escapeHtml(getValue(row, "Button2Link"))}" class="btn btn-secondary">${escapeHtml(getValue(row, "Button2Text"))}</a>`
      : "";

    return `
      <article class="content-detail">
        <a href="${type}.html" class="content-back">Back to ${type}</a>
        <h2>${escapeHtml(getValue(row, "Header"))}</h2>
        ${byline}
        <div class="content-body">${markdownToHtml(getValue(row, "Body"))}</div>
        ${button1 || button2 ? `<div class="section-actions">${button1}${button2}</div>` : ""}
        ${getValue(row, "Footnote") ? `<p class="content-footnote">${escapeHtml(getValue(row, "Footnote"))}</p>` : ""}
      </article>
    `;
  };

  const renderContentPage = async (type) => {
    const root = document.querySelector(`[data-content-page="${type}"]`);
    if (!root) return;

    const rows = (await fetchRows(type)).filter(isActive);
    if (!rows.length) {
      root.innerHTML = `<p class="content-empty">Dynamic ${type} content will appear here after the published CSV link is added.</p>`;
      return;
    }

    const selectedId = currentId();
    if (selectedId) {
      const row = rows.find((item) => rowId(item) === selectedId);
      root.innerHTML = row ? renderDetail(row, type) : `<p class="content-empty">This ${type} item was not found.</p>`;
      return;
    }

    if (type === "news") {
      root.innerHTML = `
        <div class="content-carousel">
          ${rows.slice(0, 5).map((row) => `<div class="content-carousel-slide" style="background-image:url('${escapeHtml(getValue(row, "CardThumbnail"))}')">${escapeHtml(getValue(row, "Subheader"))}</div>`).join("")}
        </div>
        <div class="content-grid">${renderCards(rows, type)}</div>
      `;
    } else {
      root.innerHTML = `<div class="content-grid">${renderCards(rows, type)}</div>`;
    }
  };

  renderOpening().catch(console.warn);
  renderContentPage("news").catch(console.warn);
  renderContentPage("projects").catch(console.warn);
}());
