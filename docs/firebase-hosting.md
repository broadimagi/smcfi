# Firebase Hosting Structure

This website is prepared for Firebase Hosting. Firebase deploys only the
`public/` folder.

## Main Files

- `firebase.json` - Firebase Hosting configuration.
- `package.json` - build, serve, and deploy commands.
- `tools/build-firebase-public.mjs` - rebuilds the deployable `public/` folder.
- `public/index.html` - main website shell with share and SEO metadata.
- `public/about/`, `public/news/`, `public/projects/`, `public/contact/`,
  `public/scholarship/` - clean, crawlable route pages.
- `public/news/ID/` and `public/projects/ID/` - share pages with thumbnails.
- `public/sitemap.xml` and `public/robots.txt` - indexing helpers.

## Commands

```bash
npm run build
firebase login
npm run serve
npm run deploy
```

Use `npm run build` before deploying. It copies the current app files and images
into `public/`, then generates static pages for sharing and indexing.

## URLs

- `/`
- `/about/`
- `/scholarship/`
- `/projects/`
- `/projects/PROJECT_ID/`
- `/news/`
- `/news/NEWS_ID/`
- `/contact/`

Old hash links like `#/news/102` still open, but clean URLs are preferred.

## Google Sheet Tabs

The app reads these published CSV tabs:

- `opening`
- `news`
- `projects`

Update the published CSV URLs in `js/content-config.js`, then run:

```bash
npm run build
```

## Supported Columns

Common:

- `ID`
- `Status`
- `Header`
- `Subheader`
- `Body`
- `CardThumbnail` or `Card Thumbnail`

Opening:

- `ImageURL` or `Image URL`
- `ImageSettings` or `Image Settings`
- `ButtonText` or `Button Text`
- `ButtonLink` or `Button Link`

News:

- `Date`
- `PublishedBy` or `Published By`
- `Footnote`

Projects:

- `Button1Text` or `Button 1 Text`
- `Button1Link` or `Button 1 Link`
- `Button2Text` or `Button 2 Text`
- `Button2Link` or `Button 2 Link`

## Body Formatting

The `Body` cell supports:

- `### Heading`
- `**bold text**`
- `[link label](https://example.com)`
- `![image alt](https://example.com/image.jpg)`
- `---` for a divider
- `* bullet item`
- `<br>` or `<br><br>` for line breaks
