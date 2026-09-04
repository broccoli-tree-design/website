# Organic layout — port for broccoli-tree-design/website

Files to drop into the repo (branch: main):

    app/globals.css   ← replace with globals.css from this folder
    app/page.tsx      ← replace with page.tsx from this folder
    public/water.svg
    public/earth-terracotta.svg
    public/fire-terracotta.svg

app/layout.tsx needs NO changes — the CSS uses the four font variables it
already sets (--serif Source Serif 4, --sans Work Sans, --display Montserrat
Alternates, --mono IBM Plex Mono).

## No longer used
components/ServiceCard.tsx and components/CaseStudy.tsx — page.tsx now renders
both lists inline (the case frames need a per-index contour class). Delete them
or leave them; nothing imports them.

style.css at the repo root is the old standalone stylesheet and is untouched.

## Palette — 6 tokens, 3 of them straight from the logo

    --background  #efeede   logo beige
    --surface     #d7dccb
    --text        #173f35   logo forest
    --text-muted  #3c4a3f
    --primary     #5b8c42   logo green
    --tertiary    #c4562a   terracotta — eyebrows, motifs, CTA hover

## Type scale

    display  1.05 line-height   clamp(30/38/52 → 54/84/116)
    snug     1.35               lede, pull quote, case headings
    body     1.75  16px
    mono     1.35  13px

## Deploy from VS Code

    git pull
    # copy the files in
    npm run dev          # check localhost:3000
    git add -A
    git commit -m "Organic layout"
    git push

Vercel builds on push to main (the repo already uses @vercel/analytics).

## Responsive

Breakpoints at 900px and 500px: the hero stacks, services go one column, case
rows stack, the water motif drops into the flow instead of floating, and the
--gutter token steps 56 → 32 → 20px.
