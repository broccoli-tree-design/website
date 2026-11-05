# Broccoli Tree Design

The portfolio site of Aiqi Li, a UX designer for legal tech.

**Live:** [broccolitree.design](https://www.broccolitree.design)

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19 and TypeScript
- Plain CSS: design tokens in `app/tokens.css` and `app/brand.css`, base styles in `app/base.css`, and a stylesheet beside each component
- Hosted on [Vercel](https://vercel.com), with Vercel Analytics and Speed Insights

## Run it locally

You need Node.js 24 or later.

```bash
npm install
npm run dev
```

Then open [localhost:3000](http://localhost:3000).

## How it's organised

| Folder | What's in it |
|---|---|
| `app/` | The page, layout, styles, metadata, sitemap and share images. Site facts (URL, title, description) live in `app/site.ts`. |
| `components/` | The case-study cards, carousel, animated parts and the eyes. |
| `lib/` | Shared hooks and helpers. |
| `public/` | Images, the logo and the profile photo. |
| `brand/` | The source of the colours and logo. Edit `brand/tokens.json` and run `npm run brand` to regenerate the site's palette, logo files, icons and LinkedIn cover. Not deployed; its README has the details. |
| `design/` | Design sources used to make the case-study screens. They aren't deployed (see `.vercelignore`); each folder has its own README. |

## Deploys

Vercel is connected to this repo:

- Merging into `main` deploys to production.
- Pushing any other branch builds a private preview.

## Versions

The site has gone through six versions, each saved as a git tag. [VERSIONS.md](VERSIONS.md) lists them and shows how to view or run an older one.

## Rights

The code is here so people can see how the site is built. The designs, writing, case studies and images are © Aiqi Li, all rights reserved. Please don't reuse them without asking.
