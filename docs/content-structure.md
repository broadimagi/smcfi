# SMCFI React Content Structure

The website is now structured as a lightweight React single-page app. `index.html`
is the only real app entry point, and older URLs such as `about.html` or
`projects.html` redirect into React hash routes.

## Files

- `index.html` - loads React, the app stylesheet, the content config, and the React app.
- `css/app.css` - main mobile-first NGO UI styles.
- `js/app.jsx` - React app, routing, opening modal, news, projects, and page views.
- `js/content-config.js` - stores the published CSV links for each sheet tab.
- `news.html`, `projects.html`, `about.html`, `contact.html`, `scholarships.html` - redirect helpers for old direct URLs.

## Google Sheet Tabs

Use these tabs and publish each one to the web as CSV:

- `opening`
- `news`
- `projects`

The app currently uses Google Visualization CSV URLs based on the spreadsheet ID.
If you publish each tab to the web and receive different CSV URLs, paste them
into `js/content-config.js`:

```js
window.SMCFI_CONTENT_CONFIG = {
  spreadsheetId: "1kkdTXbozZH22kmIB0f6L-DD9W8jElHwd0qzVUcd7mu0",
  csv: {
    opening: "PASTE_OPENING_CSV_URL_HERE",
    news: "PASTE_NEWS_CSV_URL_HERE",
    projects: "PASTE_PROJECTS_CSV_URL_HERE"
  }
};
```

## Routes

Because this is a static site, React uses hash routes:

- `index.html#/`
- `index.html#/scholarship`
- `index.html#/projects`
- `index.html#/projects/PROJECT_ID`
- `index.html#/news`
- `index.html#/news/NEWS_ID`
- `index.html#/contact`
- `index.html#/about`

## Social Share Previews

Facebook, Messenger, X, and other apps read static HTML metadata before the
React app or Google Sheet content loads. Per-news thumbnails use generated
static share pages.

GitHub Actions runs `.github/workflows/update-news-share-pages.yml` every 30
minutes and can also be run manually from the Actions tab. It reads the `news`
sheet and commits generated pages such as:

- `news/101/index.html`
- `news/102/index.html`
- `news/103/index.html`

Share links in the app use URLs such as
`https://simbayananfoundation.org/news/102/`. Each generated page contains the
news title, description, and image preview, then redirects visitors to
`index.html#/news/102`.

If you want to generate the pages locally after updating the `news` sheet, run:

```sh
node tools/generate-news-share-pages.mjs
```

If someone opens a new `/news/NEWS_ID/` URL before the generated file exists,
`404.html` redirects them into the React article route. Social previews still
need the generated page, so use the GitHub Action or local generator for the
correct Facebook/Messenger thumbnail.

## Required Columns

Column names can use spaces or compact names. For example, `Card Thumbnail`
and `CardThumbnail` both work.

Common:

- `ID`
- `status`
- `Header`
- `Subheader`
- `Body`
- `CardThumbnail` or `Card Thumbnail`

Opening:

- `ImageURL`
- `ImageSettings`
- `ButtonText`
- `ButtonLink`

News:

- `Date`
- `PublishedBy`
- `Footnote`

Projects:

- `Button1Text` or `Button 1 Text`
- `Button1Link` or `Button 1 Link`
- `Button2Text` or `Button 2 Text`
- `Button2Link` or `Button 2 Link`

## Body Formatting

The `Body` cell can be treated like a small text editor field. It supports:

- `### Heading`
- `**bold text**`
- `[link label](https://example.com)`
- `![image alt](https://example.com/image.jpg)`
- `---` for a divider
- `* bullet item`
- `<br>` or `<br><br>` for line breaks from spreadsheet text

Images on consecutive lines render as an inline gallery:

```md
![Photo 1](https://drive.google.com/file/d/FILE_ID_1/view?usp=drive_link)
![Photo 2](https://drive.google.com/file/d/FILE_ID_2/view?usp=drive_link)
```

Images separated by a blank line render stacked:

```md
![Photo 1](https://drive.google.com/file/d/FILE_ID_1/view?usp=drive_link)

![Photo 2](https://drive.google.com/file/d/FILE_ID_2/view?usp=drive_link)
```

Button links can be pasted as either a plain URL or spreadsheet-friendly
Markdown, such as `[https://smcfi.org/alumni-signup](https://smcfi.org/alumni-signup)`.
