const { useEffect, useMemo, useState } = React;

const CONTENT_CONFIG = window.SMCFI_CONTENT_CONFIG || {};
const SHEET_ID = CONTENT_CONFIG.spreadsheetId || "1kkdTXbozZH22kmIB0f6L-DD9W8jElHwd0qzVUcd7mu0";
const DEFAULT_SHEET_URLS = {
  opening: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=opening`,
  news: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=news`,
  projects: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=projects`,
};
const SHEET_URLS = { ...DEFAULT_SHEET_URLS, ...(CONTENT_CONFIG.csv || {}) };

const heroImages = [
  "images/carousel/scholars-celebration-2019.jpg",
  "images/carousel/slep-community-group.jpg",
  "images/carousel/scholars-christmas-gathering.jpg",
  "images/carousel/outdoor-scholar-community.jpg",
];

const fallbackNews = [
  {
    ID: "35-years",
    status: "Active",
    Header: "SMCFI Celebrates 35 Years of Community Service",
    Subheader: "A continuing mission of scholarship, values formation, and servant leadership.",
    Body: "For 35 years, Simbayanan ni Maria Community Foundation, Inc. has helped poor but deserving youth grow through education and community formation.",
    Date: "2026-03-20",
    PublishedBy: "SMCFI",
    CardThumbnail: "images/carousel/scholars-celebration-2019.jpg",
  },
  {
    ID: "scholar-gathering",
    status: "Active",
    Header: "Scholars Gather for Formation and Fellowship",
    Subheader: "Young leaders continue building confidence, service, and community.",
    Body: "SMCFI scholars joined mentors and partners for a day of learning, reflection, and fellowship.",
    Date: "2026-01-15",
    PublishedBy: "SMCFI",
    CardThumbnail: "images/carousel/slep-community-group.jpg",
  },
];

const fallbackProjects = [
  {
    ID: "education-run",
    status: "Active",
    Header: "SMCFI 35th Education Run",
    Subheader: "A fundraising initiative for scholarship support.",
    Body: "The Education Run brings alumni, partners, and the wider community together to support the next generation of scholars.",
    CardThumbnail: "images/carousel/outdoor-scholar-community.jpg",
    Button1Text: "Partner With Us",
    Button1Link: "#/contact",
  },
  {
    ID: "scholarship-program",
    status: "Active",
    Header: "Scholarship Program",
    Subheader: "Holistic support for poor but deserving youth.",
    Body: "The program provides academic support, values formation, mentoring, and leadership engagement.",
    CardThumbnail: "images/carousel/scholars-christmas-gathering.jpg",
    Button1Text: "Contact Us",
    Button1Link: "#/contact",
  },
  {
    ID: "alumni-engagement",
    status: "Active",
    Header: "Alumni Engagement",
    Subheader: "Graduates helping sustain the mission.",
    Body: "SMCFI alumni are invited to mentor, volunteer, and contribute to programs that strengthen the scholar community.",
    CardThumbnail: "images/carousel/slep-community-group.jpg",
  },
  {
    ID: "204",
    status: "Active",
    Header: "1st SMCFI Grand Alumni Homecoming",
    Subheader: "Once a scholar, always part of the mission",
    CardThumbnail: "images/carousel/slep-community-group.jpg",
    Body: "### Panawagan sa lahat ng Simbayanan Foundation Alumni!<br><br>Dumating na ang pinakahihintay na pagkakataon! Inaanyayahan namin kayo sa **1st SMCFI Grand Alumni Homecoming** ngayong ika-11 ng Hulyo 2026.<br><br>Ito ay pagtitipon upang muling makasama ang dating mga kaibigan, makilala ang kapwa iskolar mula sa iba't ibang batch, at ipagdiwang ang Foundation na naging bahagi ng ating paglalakbay. Higit pa sa reunion, ito ay panawagan din upang magbalik-handog.<br><br>![Alumni Gathering](https://images.unsplash.com/photo-1511578314322-379afb476865?w=800)<br><br>Sa pamamagitan ng mentorship, networking, donasyon, o pakikilahok sa mga anniversary campaign, makatutulong tayo sa susunod na henerasyon ng mga iskolar na maabot ang kanilang mga pangarap.<br><br>**Umuwi. Makipag-ugnayan. Magdiwang. Magbalik-handog.**<br><br>---<br>Details:<br>* Date: July 11, 2026<br>* Venue: 4th floor SMMPC Building, Taguig City",
    Button1Text: "Register Here",
    Button1Link: "https://smcfi.org/alumni-signup",
    Button2Text: "Give Back / Donate",
    Button2Link: "https://smcfi.org/scholarship-fund",
  },
];

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

function cleanImageUrl(value = "") {
  const text = String(value).trim();
  if (!text) return "";

  const cleaned = cleanLink(text).replace(/^['"]|['"]$/g, "");
  const patterns = [
    /=?\s*IMAGE\(\s*["']([^"']+)["']\s*\)/i,
    /drive\.google\.com\/file\/d\/([^/]+)/i,
    /drive\.google\.com\/uc\?[^#]*\bid=([^&]+)/i,
    /drive\.google\.com\/thumbnail\?[^#]*\bid=([^&]+)/i,
    /drive\.google\.com\/open\?[^#]*\bid=([^&]+)/i,
    /drive\.google\.com\/.*[?&]id=([^&]+)/i,
    /docs\.google\.com\/uc\?export=view&id=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match?.[1]) {
      return `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=w1600`;
    }
  }

  return cleaned;
}

function driveImageFallbackUrl(value = "") {
  const cleaned = cleanLink(value).replace(/^['"]|['"]$/g, "");
  const match = cleaned.match(/drive\.google\.com\/file\/d\/([^/]+)/i)
    || cleaned.match(/drive\.google\.com\/(?:uc|thumbnail|open)\?[^#]*\bid=([^&]+)/i)
    || cleaned.match(/drive\.google\.com\/.*[?&]id=([^&]+)/i)
    || cleaned.match(/docs\.google\.com\/uc\?export=view&id=([^&]+)/i);
  return match?.[1] ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(match[1])}=w1600` : "";
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

function activeRows(rows) {
  return rows.filter((row) => String(field(row, "status")).toLowerCase() === "active");
}

async function loadSheet(key, fallback) {
  try {
    const response = await fetch(SHEET_URLS[key]);
    if (!response.ok) throw new Error("Sheet not available");
    const rows = activeRows(parseCsv(await response.text()));
    return rows.length ? rows : fallback;
  } catch (error) {
    return fallback;
  }
}

function routeFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) {
    const params = new URLSearchParams(window.location.search);
    const route = (params.get("route") || "").replace(/^\/?/, "");
    if (route) {
      const [routePage = "", routeId = ""] = route.split("/");
      return { page: routePage || "home", id: routeId };
    }

    const filename = window.location.pathname.split("/").pop();
    const id = params.get("id") || "";
    if (filename === "news.html") return { page: "news", id };
    if (filename === "projects.html") return { page: "projects", id };
  }
  const [page = "", id = ""] = hash.split("/");
  return { page: page || "home", id };
}

function inlineFormat(text = "", keyPrefix = "inline") {
  const parts = [];
  const pattern = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) {
      parts.push(<strong key={`${keyPrefix}-b-${match.index}`}>{match[2]}</strong>);
    } else if (match[4] && match[5]) {
      parts.push(<a key={`${keyPrefix}-a-${match.index}`} href={cleanLink(match[5])}>{match[4]}</a>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : text;
}

function markdown(text = "") {
  const lines = String(text).replace(/\r/g, "").replace(/<br\s*\/?>/gi, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let list = [];
  let images = [];

  const renderBodyImage = (image, key) => (
    <img
      key={key}
      src={cleanImageUrl(image.src)}
      alt={image.alt}
      onError={(event) => {
        const fallback = driveImageFallbackUrl(image.src);
        if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
      }}
    />
  );

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const content = paragraph.join(" ").trim();
    if (content) output.push(<p key={`p-${output.length}`}>{inlineFormat(content, `p-${output.length}`)}</p>);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    output.push(
      <ul key={`ul-${output.length}`}>
        {list.map((item, index) => <li key={`${item}-${index}`}>{inlineFormat(item, `li-${output.length}-${index}`)}</li>)}
      </ul>
    );
    list = [];
  };

  const flushImages = () => {
    if (!images.length) return;
    if (images.length === 1) {
      output.push(renderBodyImage(images[0], `img-${output.length}`));
    } else {
      output.push(
        <div className="detail-image-gallery" key={`gallery-${output.length}`}>
          {images.map((image, index) => renderBodyImage(image, `gallery-img-${output.length}-${index}`))}
        </div>
      );
    }
    images = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (!line) {
      flushParagraph();
      flushList();
      flushImages();
    } else if (line === "---") {
      flushParagraph();
      flushList();
      flushImages();
      output.push(<hr key={`hr-${output.length}`} />);
    } else if (imageMatch) {
      flushParagraph();
      flushList();
      images.push({ alt: imageMatch[1], src: imageMatch[2] });
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      flushImages();
      output.push(<h3 key={`h3-${output.length}`}>{inlineFormat(line.slice(4), `h3-${output.length}`)}</h3>);
    } else if (line.startsWith("* ")) {
      flushParagraph();
      flushImages();
      list.push(line.slice(2).trim());
    } else {
      flushList();
      flushImages();
      paragraph.push(line);
    }
  });

  flushParagraph();
  flushList();
  flushImages();
  return output;
}

function Header({ route, setRoute }) {
  const [open, setOpen] = useState(false);
  const nav = [
    ["home", "Home"],
    ["scholarship", "Scholarship"],
    ["projects", "Projects"],
    ["news", "News"],
    ["contact", "Contact"],
    ["about", "About"],
  ];

  const go = (page) => {
    window.location.hash = page === "home" ? "#/" : `#/${page}`;
    setRoute(routeFromHash());
    setOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#/" onClick={() => setOpen(false)}>
          <img className="brand-logo" src="images/smcfiLogo.png" alt="SMCFI logo" />
          <span>Simbayanan ni Maria Community Foundation, Inc.</span>
        </a>
        <button className="nav-toggle" type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">☰</button>
        <nav className={`main-nav ${open ? "open" : ""}`}>
          {nav.map(([page, label]) => (
            <a key={page} href={page === "home" ? "#/" : `#/${page}`} className={route.page === page ? "active" : ""} onClick={(event) => { event.preventDefault(); go(page); }}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero({ title, subtitle, home = false }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!home) return undefined;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % heroImages.length), 5500);
    return () => window.clearInterval(timer);
  }, [home]);

  return (
    <section className={`hero ${home ? "home-hero" : ""}`}>
      {home && (
        <div className="hero-media">
          {heroImages.map((src, index) => <img key={src} className={index === active ? "active" : ""} src={src} alt="" />)}
        </div>
      )}
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {home && (
          <div className="btn-row">
            <a className="btn" href="#/projects">See Our Impact</a>
            <a className="btn-secondary" href="#/about">About the Foundation</a>
          </div>
        )}
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <Hero home title="From Opportunity to Impact" subtitle="Every scholar supported today becomes a leader tomorrow. For over 35 years, SMCFI has been shaping futures through education." />
      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <h2>Education is transformation</h2>
            <p>Through partners, donors, and communities, SMCFI enables young people to rise above challenges and create meaningful change.</p>
          </div>
          <div className="stats-grid">
            <div className="stat"><strong>35+</strong><span>Years of service</span></div>
            <div className="stat"><strong>500+</strong><span>Graduates</span></div>
            <div className="stat"><strong>100+</strong><span>Scholars annually</span></div>
            <div className="stat"><strong>2027</strong><span>DSWD Level 2 validity</span></div>
          </div>
        </div>
      </section>
    </>
  );
}

function Scholarship() {
  return (
    <>
      <Hero title="Scholarship & Formation" subtitle="Developing scholars through education, servant leadership, academic excellence, and community engagement." />
      <section className="section">
        <div className="section-inner card-grid">
          {["Scholarship Program", "Leadership Development", "Community Engagement", "Alumni Engagement"].map((title) => (
            <div className="card" key={title}>
              <h3>{title}</h3>
              <p>Programs that help scholars grow academically, socially, and spiritually as future leaders.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ContentHub({ type, rows, id }) {
  const backupRows = type === "projects" ? fallbackProjects : fallbackNews;
  const selected = id ? rows.find((row) => field(row, "ID") === id) || backupRows.find((row) => field(row, "ID") === id) : null;
  const featured = type === "news" ? rows[0] : null;
  const gridRows = featured ? rows.slice(1) : rows;
  if (id) {
    return selected ? <Detail type={type} row={selected} /> : <Empty message={`${type} item not found.`} />;
  }

  return (
    <section className="section">
      <div className="section-inner">
        {featured && <FeaturedNews row={featured} />}
        <div className="content-grid">
          {gridRows.map((row) => <ContentCard key={field(row, "ID")} type={type} row={row} />)}
        </div>
      </div>
    </section>
  );
}

function ContentImage({ src, className = "" }) {
  if (!src) return null;
  return (
    <div className={`content-image-frame ${className}`} style={{ "--image-url": `url(${src})` }}>
      <img src={src} alt="" />
    </div>
  );
}

function FeaturedNews({ row }) {
  const id = field(row, "ID");
  const thumbnail = cleanImageUrl(field(row, "Card Thumbnail", "CardThumbnail", "ImageURL"));
  return (
    <article className="featured-news">
      <ContentImage src={thumbnail} className="featured-news-image" />
      <div className="featured-news-body">
        <p className="detail-meta">{field(row, "Date")}</p>
        <h2>{field(row, "Header")}</h2>
        <p>{field(row, "Subheader") || field(row, "Body").replace(/<br\s*\/?>/gi, " ").slice(0, 180)}</p>
        <a className="btn" href={`#/news/${id}`}>Read More</a>
      </div>
    </article>
  );
}

function ContentCard({ type, row }) {
  const id = field(row, "ID");
  const thumbnail = cleanImageUrl(field(row, "Card Thumbnail", "CardThumbnail", "ImageURL"));
  return (
    <article className="content-card">
      <ContentImage src={thumbnail} />
      <div className="content-card-body">
        <h3>{field(row, "Header")}</h3>
        <p>{field(row, "Subheader")}</p>
        <a className="btn" href={`#/${type}/${id}`}>{type === "projects" ? "View Details" : "Read More"}</a>
      </div>
    </article>
  );
}

function shareUrlFor(type, id) {
  const origin = window.location.origin;
  if (type === "news") return `${origin}/news.html?id=${encodeURIComponent(id)}`;
  if (type === "projects") return `${origin}/projects.html?id=${encodeURIComponent(id)}`;
  return window.location.href;
}

function ShareNews({ row }) {
  const [copied, setCopied] = useState(false);
  const id = field(row, "ID");
  const title = field(row, "Header");
  const shareUrl = shareUrlFor("news", id);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      window.prompt("Copy this link", shareUrl);
    }
  };

  return (
    <div className="share-row" aria-label="Share this news">
      <span>Share</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer">Facebook</a>
      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer">X</a>
      <button type="button" onClick={copyLink}>{copied ? "Copied" : "Copy Link"}</button>
    </div>
  );
}

function Detail({ type, row }) {
  const button1Text = field(row, "Button 1 Text", "Button1Text");
  const button1Link = cleanLink(field(row, "Button 1 Link", "Button1Link"));
  const button2Text = field(row, "Button 2 Text", "Button2Text");
  const button2Link = cleanLink(field(row, "Button 2 Link", "Button2Link"));
  return (
    <section className="section">
      <article className="detail-card">
        <a href={`#/${type}`} className="muted">Back to {type}</a>
        <h2>{field(row, "Header")}</h2>
        {type === "news" && <p className="detail-meta">By {field(row, "Published By", "PublishedBy") || "SMCFI"} on {field(row, "Date")}</p>}
        {type === "news" && <ShareNews row={row} />}
        <div className="detail-body">{markdown(field(row, "Body"))}</div>
        {(button1Text || button2Text) && (
          <div className="btn-row">
            {button1Text && button1Link && <a className="btn" href={button1Link}>{button1Text}</a>}
            {button2Text && button2Link && <a className="btn-secondary" href={button2Link}>{button2Text}</a>}
          </div>
        )}
        {field(row, "Footnote") && <p className="detail-meta">{field(row, "Footnote")}</p>}
      </article>
    </section>
  );
}

function Empty({ message }) {
  return <section className="section"><div className="section-inner empty-state">{message}</div></section>;
}

function About() {
  const objectives = [
    "Provide formal and non-formal scholarships, trainings, and seminars to youth in Taguig and nearby communities.",
    "Undertake special projects for the community in times of crisis and fortuitous events.",
    "Enhance social responsibility by advocating community service and social services.",
    "Consolidate donations, grants, and fundraising support for poor and marginalized sectors.",
    "Network with local and international institutions for socio-economic projects.",
    "Strengthen values formation, leadership engagement, academic excellence, community building, and cooperativism.",
  ];
  const timeline = ["1989 - Educational and livelihood assistance began.", "1991 - SMCFI was established as a non-stock, non-profit organization.", "2005 - Transitioned into a dedicated community foundation.", "2017 - Received PCNC accreditation.", "2022 - Renewed DSWD Level 2 accreditation through 2027.", "2026 - Celebrates 35 years of service in Taguig."];
  return (
    <>
      <Hero title="About Us" subtitle="A community development foundation in Taguig City forming poor youth as servants and future leaders." />
      <section className="section">
        <div className="section-inner about-layout">
          <div className="panel card">
            <h2>Who We Are</h2>
            <p>The Simbayanan ni Maria Community Foundation, Inc. is a non-stock, non-profit, and PCNC-accredited organization dedicated to educational opportunities for underprivileged yet deserving youth.</p>
            <h3>Mission</h3>
            <p>To provide holistic formation on servant leadership, academic excellence, and leadership engagement in the community.</p>
            <h3>Vision</h3>
            <p>A community development foundation that provides social empowerment to poor youth as servants and future leaders.</p>
          </div>
          <div className="panel card">
            <h2>Certifications</h2>
            <p><strong>DSWD Level 2</strong><br />Accredited as a community-based social welfare agency until 2027.</p>
            <p><strong>PCNC Member</strong><br />Certified by the Philippine Council for NGO Certification.</p>
            <p><strong>BIR Donee Status</strong><br />Registered Donee Institution for donor tax exemption.</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-inner">
          <div className="section-heading"><h2>Objectives</h2></div>
          <ol className="objectives">{objectives.map((item) => <li key={item}>{item}</li>)}</ol>
        </div>
      </section>
      <section className="section">
        <div className="section-inner">
          <div className="section-heading"><h2>History</h2></div>
          <div className="timeline">{timeline.map((item) => <div className="timeline-item" key={item}><strong>{item.split(" - ")[0]}</strong><p>{item.split(" - ")[1]}</p></div>)}</div>
        </div>
      </section>
    </>
  );
}

function Contact() {
  return (
    <>
      <Hero title="Contact Us" subtitle="Reach out for inquiries, partnerships, scholarship support, and donations." />
      <section className="section">
        <div className="section-inner contact-grid">
          <form className="panel card form-grid">
            <h2>Send a Message</h2>
            <input placeholder="Full Name" />
            <input placeholder="Email Address" type="email" />
            <select><option>General Inquiry</option><option>Scholarship Application</option><option>Partnership / Sponsorship</option><option>Donation</option></select>
            <textarea rows="5" placeholder="Your Message"></textarea>
            <button className="btn" type="button">Submit</button>
          </form>
          <div className="panel card">
            <h2>Contact Information</h2>
            <p><strong>Email</strong><br />simbayananfoundation@gmail.com</p>
            <p><strong>Phone</strong><br />+63 900 000 0000</p>
            <p><strong>Location</strong><br />Taguig City, Philippines</p>
            <p><strong>Office Hours</strong><br />Monday - Friday<br />9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </section>
    </>
  );
}

function OpeningModal({ rows }) {
  const [visible, setVisible] = useState(true);
  const row = rows[0];
  if (!visible || !row) return null;
  const setting = field(row, "Image Settings", "ImageSettings") || "Top";
  const imageUrl = cleanImageUrl(field(row, "Image URL", "ImageURL"));
  const buttonText = field(row, "Button Text", "ButtonText");
  const buttonLink = cleanLink(field(row, "Button Link", "ButtonLink"));
  return (
    <div className="opening-modal">
      <div className={`opening-card ${setting === "Background" ? "background" : ""} ${setting === "Image Only" ? "image-only" : ""}`} style={setting === "Background" ? { backgroundImage: `url(${imageUrl})` } : {}}>
        <button className="opening-close" type="button" onClick={() => setVisible(false)}>×</button>
        {imageUrl && setting !== "Background" && (
          <div className="opening-media" style={{ "--image-url": `url(${imageUrl})` }}>
            <img src={imageUrl} alt="" />
          </div>
        )}
        {setting !== "Image Only" && (
          <div className="opening-body">
            <h2>{field(row, "Header")}</h2>
            <p>{field(row, "Subheader")}</p>
            {markdown(field(row, "Body"))}
            {buttonText && buttonLink && <a className="btn" href={buttonLink}>{buttonText}</a>}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(routeFromHash());
  const [news, setNews] = useState(fallbackNews);
  const [projects, setProjects] = useState(fallbackProjects);
  const [opening, setOpening] = useState([]);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    loadSheet("news", fallbackNews).then(setNews);
    loadSheet("projects", fallbackProjects).then(setProjects);
    loadSheet("opening", []).then(setOpening);
  }, []);

  const page = useMemo(() => {
    if (route.page === "scholarship") return <Scholarship />;
    if (route.page === "projects") return <><Hero title="Projects" subtitle="Programs, campaigns, and initiatives supporting youth transformation." /><ContentHub type="projects" rows={projects} id={route.id} /></>;
    if (route.page === "news") return <><Hero title="News & Updates" subtitle="Stories, announcements, and community updates from SMCFI." /><ContentHub type="news" rows={news} id={route.id} /></>;
    if (route.page === "contact") return <Contact />;
    if (route.page === "about") return <About />;
    return <Home />;
  }, [route, news, projects]);

  return (
    <div className="site-shell">
      <Header route={route} setRoute={setRoute} />
      <main>{page}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span>© 2026 Simbayanan ni Maria Community Foundation, Inc.</span>
          <a href="https://broadimagi.com" target="_blank">Powered by Broadimagi</a>
        </div>
      </footer>
      <OpeningModal rows={opening} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
