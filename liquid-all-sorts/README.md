# Liquid All Sorts — Website

Premium black & gold website for **Liquid All Sorts** — car detailing,
motorhome & caravan detailing, and pressure washing across Duffield,
Belper and the East Midlands.

Static site + one Cloudflare Pages Function (no build step, no
framework). Push it to GitHub, connect to Cloudflare Pages, done.

```
├── index.html              → the whole site (one page, anchor sections)
├── css/styles.css          → black & gold design system
├── js/main.js               → mobile nav + form submit handling
├── functions/api/contact.js → Cloudflare Pages Function: form → Telegram
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

## 3. Wire up the Telegram bot (when you're ready)

The enquiry form already posts to `/api/contact`, which is a Cloudflare
Pages Function ready to forward straight to Telegram. It just needs two
values once your bot exists:

1. Message **@BotFather** on Telegram → `/newbot` → follow the prompts →
   copy the **bot token** it gives you.
2. Add your new bot to the chat/channel/group you want enquiries to land
   in, send it any message, then get the **chat ID** — easiest way is to
   visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a
   browser after sending a message, and read the `"chat":{"id": ...}`
   value.
3. In Cloudflare Pages → your project → **Settings** →
   **Environment variables** → add:
   - `TELEGRAM_BOT_TOKEN` = the token from step 1
   - `TELEGRAM_CHAT_ID` = the chat ID from step 2
4. Re-deploy (Cloudflare Pages → **Deployments** → **Retry deployment**,
   or just push a new commit). Enquiries submitted on the site will now
   land in Telegram instantly.

Until those two variables are set, the form fails gracefully — the
visitor sees a message asking them to call/text 07777 213180 instead,
so no enquiry is ever silently lost.

## 4. Editing content

Everything visible lives in `index.html` — services, the area list,
testimonials, and the contact details are plain text in the markup, so
no CMS or rebuild is needed. Colours, fonts and spacing live in
`css/styles.css` under the `:root` variables at the top if the palette
ever needs adjusting.

### Images
The current photography is hot-linked from Unsplash (free-to-use stock)
so the site launches with real, relevant imagery straight away. For a
faster and fully independent site, swap in your own photos of actual
jobs: drop them in an `/assets` folder and update the `src` attributes
in `index.html` — real before/afters of Liquid All Sorts' own work will
convert better than stock once you've got a backlog of finished jobs to
photograph.

### Reviews
The four testimonials in the "Reviews" section are launch-placeholder
copy written to match the tone of real customer feedback. Swap them for
genuine reviews (Google Business Profile, Facebook, or direct
quotes) as soon as they're available — real names/areas and a link to
the Google listing will carry more trust than anything pre-written.

## 5. Local preview

No build tools needed — any static server works:

```bash
cd liquid-all-sorts
python3 -m http.server 8080
# visit http://localhost:8080
```

The `/api/contact` function only runs under Cloudflare's environment
(locally or deployed) — if you want to test it locally, install
Wrangler and run `npx wrangler pages dev .` instead of a plain static
server.
