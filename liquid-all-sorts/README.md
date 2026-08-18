# Liquid All Sorts — Website

Premium black & gold website for **Liquid All Sorts** — car detailing,
motorhome & caravan detailing, and pressure washing across Belper, the
Peak District and North Derbyshire.

Plain static site — no build step, no framework, no backend. Push it to
GitHub, connect to Cloudflare Pages, done. Every call-to-action and the
enquiry form route straight to WhatsApp, so there's nothing to
configure before it goes live.

```
├── index.html                          → homepage (one page, anchor sections)
├── car-detailing.html                  → service page
├── motorhome-caravan-detailing.html    → service page
├── pressure-washing.html               → service page
├── ceramic-coating.html                → service page
├── fleet-valeting.html                 → service page
├── gutter-roof-cleaning.html           → service page
├── areas-we-cover.html                 → full list of towns covered, with local content
├── sitemap.xml                         → lists every page for search engines
├── robots.txt                          → allows crawling, points to the sitemap
├── css/styles.css                      → black & gold design system
├── js/main.js                          → mobile nav + WhatsApp form handling
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

## 2. Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Pick the `liquid-all-sorts` repo.
3. Build settings: **Framework preset → None**. Leave the build command
   blank and the output directory as `/` (this is a plain static site,
   nothing to build).
4. Click **Save and Deploy**. Cloudflare gives you a
   `liquid-all-sorts.pages.dev` URL immediately.

### Custom domain
Pages project → **Custom domains** → add your domain. If it's already
on Cloudflare DNS this is a couple of clicks; otherwise it'll ask you to
update your nameservers first.

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

Everything visible on the homepage lives in `index.html` — services, the
area list, testimonials, and the contact details are plain text in the
markup, so no CMS or rebuild is needed. Each service also has its own
standalone page (`car-detailing.html`, etc.) for anyone landing directly
from a search result. Colours, fonts and spacing live in `css/styles.css`
under the `:root` variables at the top if the palette ever needs
adjusting.

### Images
The current photography is hot-linked from Unsplash (free-to-use stock)
so the site launches with real, relevant imagery straight away. For a
faster and fully independent site, swap in your own photos of actual
jobs: drop them in an `/assets` folder and update the `src` attributes
across the HTML files — real before/afters of Liquid All Sorts' own work
will convert better than stock once you've got a backlog of finished
jobs to photograph.

### Reviews
The four testimonials in the "Reviews" section are launch-placeholder
copy written to match the tone of real customer feedback. Swap them for
genuine reviews (Google Business Profile, Facebook, or direct
quotes) as soon as they're available — real names/areas and a link to
the Google listing will carry more trust than anything pre-written.

## 5. SEO notes

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

## 6. Local preview

No build tools needed — any static server works:

```bash
cd liquid-all-sorts
python3 -m http.server 8080
# visit http://localhost:8080
```
