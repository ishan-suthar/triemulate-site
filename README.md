# TriEmulate — landing page

Static site. No build step, no dependencies, no server-side code.

## Structure

    triemulate-site/
      index.html              landing: hero, 3D eight-stage journey, three teasers, access
      method.html             the problem (strands), eight-stage flow, start-date matrix, eligibility
      output.html             protocol table, causal graph, reporting coverage
      boundaries.html         does / will not do, your data, access
      assets/
        css/site.css          design system: palette, grid, components
        js/journey.js         landing 3D journey through the eight stages (needs three.js)
        js/strands.js         arms-separating canvas (method.html)
        js/cohort.js          eligibility attrition scatter (method.html)
        js/flow.js            interactive eight-stage sequence (method.html)
      robots.txt              disallows indexing (see "Before publishing")
      .nojekyll               stops GitHub Pages from processing the folder
      README.md

The landing page loads three.js r128 from cdnjs, then assets/js/journey.js.
If WebGL is unavailable, or the visitor has reduced motion switched on, the
journey is replaced by a plain numbered list of the eight stages.

Each page loads only the scripts it uses. output.html and boundaries.html
load none. Nav is repeated in each file; there is no template step, so a
nav change means editing four files.

Fonts load from Fontshare (General Sans) and Google Fonts (JetBrains Mono).
Both are remote; the page degrades to system sans and monospace if blocked.

## Running locally

    cd triemulate-site
    python3 -m http.server 8080

Then open http://localhost:8080. Opening index.html directly with file://
also works, since nothing is fetched relative to an origin.

## Hosting

Any static host. Drop the folder contents at the web root.

- GitHub Pages: push to a repo, Settings > Pages > deploy from branch.
  The .nojekyll file is already present.
- Netlify / Cloudflare Pages / Vercel: drag the folder in. No build
  command, publish directory is the folder itself.
- S3 / nginx / Apache: copy as-is, index.html is the default document.

## Before publishing

1. Contact link. The Access button now points at
   `mailto:research@triemulate.com`. Change it if you want a different
   address on the public page.
2. Indexing is ON. robots.txt allows all crawlers and no page carries a
   noindex tag. This is deliberate: the provisional was filed on
   19 September 2026, so public disclosure no longer risks the filing date
   for anything the application describes. To go private again, put
   `Disallow: /` in robots.txt and add
   `<meta name="robots" content="noindex, nofollow">` to each page head.

3. Custom domain. For GitHub Pages, add a file named `CNAME` at the web
   root containing just your domain (e.g. `triemulate.com`), then point a
   CNAME record at `<user>.github.io`, or A records at GitHub's IPs for an
   apex domain. Netlify, Cloudflare Pages and Vercel take the domain in
   their dashboard instead and no CNAME file is needed. Enable HTTPS after
   DNS resolves.

4. Before launch, set the canonical and social image. Each page has Open
   Graph title and description tags but no `og:url`, `og:image`, or
   `<link rel="canonical">`, because the domain was unknown when these
   were generated. Add all three once the domain is live.
5. Add a favicon if you want one. None is referenced.

## Accuracy notes

Figures on this page fall into two groups.

**Read from the codebase, and correct as written:**

- 9 causal roles — `CausalRole` in `tte_knowledge_base.py`
- 14 bias mechanisms — `BIAS_AUDIT_FRAMEWORK`
- 10 candidate start dates — `TimeZeroAnchorType`, and the ratings in the
  start-date table come from `TIME_ZERO_SCORING_PROFILES`
- 21 reporting items, split 6 / 7 / 8 — `TARGET_CHECKLIST`, counted by
  `population_mode`
- 8 protocol components — `PROTOCOL_COMPONENTS`
- 39 tables / 432 columns — the built-in OMOP CDM v5.4 catalog, built
  from the vendored OHDSI specification in `tools/specs/omop54/`

**Invented for illustration, and labelled as such on the page:**

- "Open backdoor paths: 11" in the hero panel
- All cohort attrition figures in the Eligibility section
- The example causal graph

If the knowledge base changes, the four numbers in the Structure section
metrics block and the 6 / 7 / 8 split in Reporting need updating by hand.
They are not generated.

## Patent marking

The footer and nav carry "Patent Pending", which is accurate: US
provisional application 64/158,404 was filed on 19 September 2026. If
the non-provisional is not filed by 19 September 2027, the provisional
lapses and the marking has to come off.

## Claims deliberately avoided

The page does not say the engine extracts variables, computes balance,
estimates effects, keeps data on-premise, or already supports every EHR
schema. None of those are true today, and the "What it will not do"
column exists partly to keep the rest of the page honest.
