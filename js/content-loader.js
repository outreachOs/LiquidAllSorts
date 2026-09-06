// Liquid All Sorts — applies CMS content on top of the static markup.
// Runs on every page. Falls back silently to the baked-in HTML if the
// API isn't reachable or hasn't been set up yet — nothing breaks.

(function () {
  function formatUkMobile(digits) {
    // "447777213180" -> "07777 213180"
    let d = (digits || '').replace(/[^\d]/g, '');
    if (d.startsWith('44')) d = '0' + d.slice(2);
    if (d.length !== 11) return null;
    return d.slice(0, 5) + ' ' + d.slice(5);
  }

  function applyWhatsApp(number) {
    if (!number) return;
    const display = formatUkMobile(number);

    document.querySelectorAll('[data-wa-link]').forEach((a) => {
      try {
        const url = new URL(a.href);
        url.pathname = '/' + number;
        a.href = url.toString();
      } catch {
        a.href = 'https://wa.me/' + number;
      }
    });

    if (display) {
      document.querySelectorAll('[data-wa-text]').forEach((el) => {
        el.textContent = display;
      });
    }
  }

  function applyHero(hero) {
    if (!hero) return;
    const eyebrow = document.querySelector('[data-cms="hero-eyebrow"]');
    const sub = document.querySelector('[data-cms="hero-sub"]');
    const image = document.querySelector('[data-cms="hero-image"]');
    if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;
    if (sub && hero.sub) sub.textContent = hero.sub;
    if (image && hero.image) image.src = hero.image;
  }

  function applyServices(services) {
    if (!Array.isArray(services)) return;
    services.forEach((service) => {
      if (!service || !service.id) return;
      const card = document.querySelector('[data-service-id="' + CSS.escape(service.id) + '"]');
      if (!card) return;
      const nameEl = card.querySelector('[data-field="name"]');
      const descEl = card.querySelector('[data-field="desc"]');
      const imageEl = card.querySelector('[data-field="image"]');
      if (nameEl && service.name) nameEl.textContent = service.name;
      if (descEl && service.desc) descEl.textContent = service.desc;
      if (imageEl && service.image) imageEl.src = service.image;
    });
  }

  function applyGallery(gallery) {
    if (!Array.isArray(gallery)) return;
    gallery.forEach((url, index) => {
      if (!url) return;
      const img = document.querySelector('[data-gallery-index="' + index + '"]');
      if (img) img.src = url;
    });
  }

  function applyAreas(areas) {
    const list = document.querySelector('[data-cms-list="areas"]');
    if (!list || !Array.isArray(areas) || areas.length === 0) return;
    list.innerHTML = '';
    areas.forEach((town) => {
      const li = document.createElement('li');
      li.textContent = town;
      list.appendChild(li);
    });
  }

  function applyTestimonials(testimonials) {
    const grid = document.querySelector('[data-cms-list="testimonials"]');
    if (!grid || !Array.isArray(testimonials) || testimonials.length === 0) return;
    grid.innerHTML = '';
    testimonials.forEach((t) => {
      const figure = document.createElement('figure');
      figure.className = 'review-card';

      const stars = document.createElement('div');
      stars.className = 'review-card__stars';
      stars.setAttribute('aria-label', '5 out of 5 stars');
      stars.textContent = '\u2605\u2605\u2605\u2605\u2605';

      const quote = document.createElement('blockquote');
      quote.textContent = t.text;

      const caption = document.createElement('figcaption');
      caption.textContent = t.name;
      if (t.area) {
        const span = document.createElement('span');
        span.textContent = ' \u2014 ' + t.area;
        caption.appendChild(span);
      }

      figure.appendChild(stars);
      figure.appendChild(quote);
      figure.appendChild(caption);
      grid.appendChild(figure);
    });
  }

  async function loadContent() {
    try {
      const res = await fetch('content.json', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();

      applyWhatsApp(data.whatsapp);
      applyHero(data.hero);
      applyServices(data.services);
      applyAreas(data.areas);
      applyTestimonials(data.testimonials);
      applyGallery(data.gallery);
    } catch {
      // content.json not reachable — keep the static content already in the page
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
