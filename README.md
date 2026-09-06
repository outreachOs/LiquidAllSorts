# Liquid All Sorts — Website

Premium black & gold website for **Liquid All Sorts** — car detailing,
motorhome & caravan detailing, and pressure washing across Belper, the
Peak District and North Derbyshire.

A real Cloudflare Worker (not a plain "static assets" deployment) that
serves this site's files directly and handles one small API route for
the admin dashboard. Push to GitHub, connect to Cloudflare, done.
Every call-to-action and the enquiry form route straight to WhatsApp.

```
├── index.html                          → homepage (one page, anchor sections)
├── car-detailing.html                  → service page
├── motorhome-caravan-detailing.html    → service page
├── pressure-washing.html               → service page
├── ceramic-coating.html                → service page
├── fleet-valeting.html                 → service page
├── gutter-roof-cleaning.html           → service page
├── areas-we-cover.html                 → full list of towns covered, with local content
├── admin.html                          → admin dashboard (see section 5)
├── content.json                        → editable site content, read by every page
├── worker.js                           → the site's Worker: serves static files + /api/save
├── wrangler.jsonc                      → tells Cloudflare this is a Worker, not static-only
├── sitemap.xml                         → lists every page for search engines
├── robots.txt                          → allows crawling, points to the sitemap
├── css/styles.css                      → black & gold design system (the live site)
├── css/admin.css                       → separate light/spacious theme for the admin dashboard
├── js/main.js                          → mobile nav + WhatsApp form handling
├── js/content-loader.js                → applies content.json on every page
├── js/admin.js                         → admin dashboard logic
└── README.md
```

## 1. Put it on GitHub

```bash
cd liquid-all-sorts
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/liquid-all-sorts.git
git push -u origin main
```

(Or use GitHub Desktop / GitHub's "upload files" web UI if you'd rather
not use the command line.)

## 2. Connect Cloudflare

Cloudflare now serves static sites through Workers rather than the
older "Pages" product, so this connects a little differently than it
used to:

1. Cloudflare dashboard → **Workers & Pages** → **Create**.
2. Choose **Import a repository** (not a template) → connect your
   GitHub account if you haven't already → pick the repo.
3. Cloudflare will detect `wrangler.jsonc` in the repo and set this up
   as a Worker with static assets automatically — that file is what
   makes this a real Worker (with environment variables available)
   rather than a plain static-only deployment.
4. Leave the build command blank — there's nothing to build.
5. Click **Deploy**. Cloudflare gives you a
   `liquid-all-sorts.<your-account>.workers.dev` URL immediately.

If you already created a project the old way (as plain static assets,
which is likely what caused the "static assets can't have variables"
message), the simplest fix is to delete that project and reconnect the
repo as above, now that `wrangler.jsonc` and `worker.js` are in place —
Cloudflare will pick up on them and create it as a proper Worker
project this time.

### Custom domain
Worker → **Settings** → **Domains & Routes** → add your domain. If
it's already on Cloudflare DNS this is a couple of clicks; otherwise
it'll ask you to update your nameservers first.

## 3. WhatsApp routing (already live, nothing to set up)

Every "Call"/CTA button and the enquiry form point at
`https://wa.me/447777213180`. There's no bot, token or environment
variable involved — `wa.me` links just open a chat with that number,
pre-filled with a message, on whatever device the visitor is using
(WhatsApp app on mobile, WhatsApp Web on desktop).

- The header, hero, "Standard" section, contact box and mobile sticky
  bar all open WhatsApp with a generic "I'd like a quote" message.
- The full enquiry form builds a message from whatever the visitor
  typed (name, phone, service, area, details) and opens WhatsApp with
  that pre-filled instead, so nothing they wrote gets lost even though
  there's no backend.

To change the number, search `447777213180` in `index.html` and
`js/main.js` and replace every instance (UK format, no leading `0`, no
`+`, no spaces).

## 4. Editing content

Two ways to edit content now:

1. **The admin dashboard** (`/admin.html`) — for the fields that change
   often: the WhatsApp number, the hero subtext, each service's name and
   description, the homepage list of towns, and reviews. See section 5
   below for setup — this is the "no code changes needed" path.
2. **Directly in the HTML** — for anything not in the dashboard: the
   full service pages, the detailed `areas-we-cover.html` content,
   images, colours, and the styled two-line headline in the hero.
   Colours, fonts and spacing live in `css/styles.css` under the
   `:root` variables at the top.

### Images
The current photography is hot-linked from Unsplash (free-to-use stock)
so the site launches with real, relevant imagery straight away. For a
faster and fully independent site, swap in your own photos of actual
jobs: drop them in an `/assets` folder and update the `src` attributes
across the HTML files — real before/afters of Liquid All Sorts' own work
will convert better than stock once you've got a backlog of finished
jobs to photograph.

### Reviews
The four testimonials that ship with the site are launch-placeholder
copy written to match the tone of real customer feedback. Swap them for
genuine reviews via the admin dashboard as soon as they're available —
real names/areas and a link to the Google listing will carry more trust
than anything pre-written.

## 5. Admin dashboard (CMS) setup

The site has an admin panel at `/admin.html` so your friend can update
the site directly — no code, no you present each time, and just a
short, ordinary password to log in.

**What it can edit:** the WhatsApp number (updates every WhatsApp
button and displayed number sitewide), the hero photo and subtext,
each of the 6 service photos/names/descriptions on the homepage, the
4 "Recent Work" gallery photos, the homepage's list of towns covered,
and all reviews.

**What it can't edit (by design, to keep this simple):** the six
individual service pages, the detailed `areas-we-cover.html` content,
and the styled two-line hero headline. Those stay code-edited —
reasonable, since they change far less often than a phone number, a
photo or a review.

### Uploading photos

Every photo slot in the dashboard (hero, each service, each gallery
spot) has a **Change Photo** button under it — pick a file from your
friend's phone or computer, see an instant preview, and it uploads
when you hit **Save Changes**. Uploaded photos are committed straight
into the repo under `uploads/`, so they're hosted on the same site,
not a third-party image service.

A couple of practical limits, both there to keep saves fast and
reliable: images over 6MB are rejected with a message asking for a
smaller one (most phone photos are well under this once actually
selected, but very high-res camera exports can exceed it), and photos
aren't automatically resized or compressed — for the best-looking,
fastest-loading site, images somewhere in the 1500–2000px-wide range
work best. That's a nice-to-know for later, not something that blocks
anyone from just uploading a normal photo today.

### Why this needs one small server-side piece

A plain static site can't keep any secret hidden — anything typed
into its HTML or JS is visible to anyone who opens the browser's dev
tools. And GitHub itself refuses to let a real access token be
committed into the repo's code at all (that's the error you hit
earlier). So a genuinely short, ordinary password and a hidden real
credential can't both live in a fully static site — something has to
sit server-side to keep the real credential out of view.

The lightest possible version of that is the Worker itself
(`worker.js`, included in this project already) plus two values typed
into the Cloudflare dashboard once. No KV, no bindings, nothing else —
about two minutes, done once, never touched again.

### One-time setup

1. **Generate a GitHub access token** (this is the real credential —
   your friend never sees it):
   - GitHub → your profile photo → **Settings** → **Developer
     settings** → **Personal access tokens** → **Fine-grained tokens**
     → **Generate new token**.
   - Name it `liquid-all-sorts-admin`, set **Resource owner** to
     `outreachOs`, and under **Repository access** choose **Only
     select repositories** → `LiquidAllSorts`.
   - Under **Permissions** → **Repository permissions**, set
     **Contents** to **Read and write**. Leave everything else as
     No access.
   - Generate it and copy the token (starts with `github_pat_...`).
2. **Set two environment variables.** Cloudflare dashboard → **Workers
   & Pages** → your Worker → **Settings** → **Variables and Secrets**
   → **Add**:
   - `ADMIN_PASSWORD` (type: Text or Secret) — whatever short password
     your friend will actually log in with (e.g. a normal word or
     phrase)
   - `GITHUB_TOKEN` (type: **Secret**) — the token from step 1
3. Click **Deploy** to apply them (the dashboard prompts for this
   after adding variables).

Both values live only in Cloudflare's environment — never in a file,
never in git, never sent to the browser. That's what lets the
password stay short without exposing the real credential. This only
works because the project is a real Worker (see section 2) — a plain
static-assets deployment has nowhere to put these at all, which is
the error that started this.

If your GitHub repo isn't `outreachOs/LiquidAllSorts`, or the default
branch isn't `main`, update the three constants at the top of
`worker.js` to match.

### Using it

Go to `https://<your-domain>/admin.html`, log in with the short
password, edit, and hit **Save Changes**. Cloudflare will redeploy
automatically — usually live within a minute. The page is excluded
from search engines (`robots.txt` and a `noindex` tag).

If `ADMIN_PASSWORD`/`GITHUB_TOKEN` aren't set yet, saving will say so
plainly rather than failing silently — the dashboard itself still
opens fine either way, since it just reads the same public
`content.json` the site already shows.

## 6. SEO notes

A few things are already in place, and a couple of things are worth
doing once the site is live on its final domain:

- **Meta titles/descriptions** — every page has its own, written around
  what that page is actually about (a service, or the coverage area)
  rather than duplicating the homepage's.
- **Open Graph & Twitter tags** — so links shared on social media or in
  WhatsApp show a proper preview card instead of a bare link.
- **Structured data (JSON-LD)** — a `LocalBusiness` block on the
  homepage (name, phone, service area, list of services) and a
  `Service` block on each service page. This is what lets Google show
  rich results (star ratings once reviews are connected, service
  listings, etc.) rather than a plain blue link.
- **`sitemap.xml` and `robots.txt`** — submit the sitemap URL in Google
  Search Console once the site is live, so new/updated pages get
  crawled faster.
- **Internal linking** — service cards on the homepage link to their
  own page and back again ("Learn more" + "Other services"), and the
  area section links through to the full `areas-we-cover.html` page.
  This is one of the simplest, highest-value local SEO habits: it helps
  Google understand how the pages relate to each other.
- **`loading="lazy"` on below-the-fold images** — keeps the initial
  page load lighter, which is itself a (minor) ranking factor.

**Still to update once the real domain is live:** every canonical URL,
Open Graph URL and the JSON-LD `url` field currently point at
`https://liquidallsorts.pages.dev/` as a placeholder. Once a custom
domain is connected in Cloudflare Pages, search-and-replace that
placeholder for the real domain across all the HTML files (and update
`sitemap.xml`/`robots.txt` too) — otherwise search engines will index
the `.pages.dev` address instead of the real one.

Beyond that, the single biggest lever left is content: a Google
Business Profile (verified, with the same NAP — name, address, phone —
as the site), plus a handful of real customer reviews once jobs start
coming in, will do more for local rankings than any on-page tweak.

## 7. Local preview

For just browsing the pages, any static server works and needs no
install:

```bash
cd liquid-all-sorts
python3 -m http.server 8080
# visit http://localhost:8080
```

That won't run `/api/save` — the admin page will still open and show
current content (it reads the public `content.json` directly), but
Save will fail since there's no Worker running locally. To preview it
exactly as Cloudflare will run it, including `/api/save`, use Wrangler
instead (this also matches how it deploys, since it reads the same
`wrangler.jsonc`):

```bash
npx wrangler dev
```
