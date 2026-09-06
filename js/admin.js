(function () {
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');

  const whatsappInput = document.getElementById('whatsapp');
  const heroEyebrowInput = document.getElementById('heroEyebrow');
  const heroSubInput = document.getElementById('heroSub');
  const heroPreview = document.getElementById('heroPreview');
  const heroImageInput = document.getElementById('heroImageInput');
  const servicesGrid = document.getElementById('servicesGrid');
  const galleryGrid = document.getElementById('galleryGrid');
  const areasList = document.getElementById('areasList');
  const testimonialsGrid = document.getElementById('testimonialsGrid');

  let password = '';
  // imagePaths holds the current value (existing URL, or a freshly generated
  // uploads/... path) for every image slot, keyed by slot id.
  const imagePaths = {};
  // pendingUploads holds the actual file data for anything changed this
  // session, keyed the same way — only these get sent/committed on Save.
  const pendingUploads = {};

  const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6MB

  function setStatus(el, msg, type) {
    el.textContent = msg;
    el.classList.remove('is-success', 'is-error');
    if (type) el.classList.add(type === 'success' ? 'is-success' : 'is-error');
  }

  function showDashboard() { loginScreen.hidden = true; dashboard.hidden = false; }
  function showLogin() { dashboard.hidden = true; loginScreen.hidden = false; }

  async function fetchContent() {
    const res = await fetch('content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load the current site content.');
    return res.json();
  }

  // ---------- Login ----------
  // content.json is public data (it's what the site already shows), so
  // logging in just loads it straight in — the password itself is only
  // checked server-side, at the point of saving.
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    password = document.getElementById('password').value;
    setStatus(loginStatus, 'Loading...', null);

    try {
      const content = await fetchContent();
      sessionStorage.setItem('las_admin_pw', password);
      setStatus(loginStatus, '', null);
      populateForm(content);
      showDashboard();
    } catch (err) {
      setStatus(loginStatus, err.message || 'Could not load the site content.', 'error');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    password = '';
    sessionStorage.removeItem('las_admin_pw');
    showLogin();
  });

  // ---------- Populate ----------
  function populateForm(content) {
    whatsappInput.value = content.whatsapp || '';
    heroEyebrowInput.value = (content.hero && content.hero.eyebrow) || '';
    heroSubInput.value = (content.hero && content.hero.sub) || '';

    setImage('hero', (content.hero && content.hero.image) || '', heroPreview);
    heroImageInput.addEventListener('change', () => handleFileChosen('hero', heroImageInput, heroPreview));

    servicesGrid.innerHTML = '';
    (content.services || []).forEach((service) => addServiceCard(service));

    galleryGrid.innerHTML = '';
    (content.gallery || []).forEach((url, index) => addGallerySlot(index, url));

    areasList.innerHTML = '';
    (content.areas || []).forEach((town) => addAreaChip(town));

    testimonialsGrid.innerHTML = '';
    (content.testimonials || []).forEach((t) => addTestimonialCard(t));
  }

  function setImage(key, url, imgEl) {
    imagePaths[key] = url || '';
    if (imgEl) imgEl.src = resolveSrc(url);
  }

  function resolveSrc(pathOrUrl) {
    if (!pathOrUrl) return '';
    // uploads/... paths are relative to the site root
    return pathOrUrl;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function escapeAttr(str) { return escapeHtml(str); }

  // ---------- Image upload handling ----------
  function handleFileChosen(key, inputEl, previewEl) {
    const file = inputEl.files && inputEl.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      inputEl.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('That image is quite large (over 6MB) — please choose a smaller one.');
      inputEl.value = '';
      return;
    }

    const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').split('+')[0];
    const slug = key.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const path = `uploads/${slug}-${Date.now()}.${ext}`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = String(dataUrl).split(',')[1] || '';
      pendingUploads[key] = { path, dataBase64: base64 };
      imagePaths[key] = path;
      if (previewEl) previewEl.src = dataUrl; // instant local preview
    };
    reader.readAsDataURL(file);
  }

  // ---------- Services ----------
  function addServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'svc-card';
    card.dataset.serviceId = service.id;
    card.innerHTML =
      '<div class="image-slot">' +
        '<img class="image-slot__preview" alt="">' +
        '<label class="image-slot__upload">Change Photo<input type="file" accept="image/*" hidden></label>' +
      '</div>' +
      '<div class="svc-card__body">' +
        '<div class="svc-card__id">' + escapeHtml(service.id) + '</div>' +
        '<label>Name</label>' +
        '<input type="text" class="svc-name" value="' + escapeAttr(service.name) + '">' +
        '<label>Description</label>' +
        '<textarea class="svc-desc" rows="3">' + escapeHtml(service.desc) + '</textarea>' +
      '</div>';

    const preview = card.querySelector('.image-slot__preview');
    const fileInput = card.querySelector('input[type="file"]');
    const key = 'service:' + service.id;
    setImage(key, service.image || '', preview);
    fileInput.addEventListener('change', () => handleFileChosen(key, fileInput, preview));

    servicesGrid.appendChild(card);
  }

  // ---------- Gallery ----------
  function addGallerySlot(index, url) {
    const slot = document.createElement('div');
    slot.className = 'image-slot';
    slot.dataset.galleryIndex = index;
    slot.innerHTML =
      '<img class="image-slot__preview" alt="">' +
      '<label class="image-slot__upload">Change Photo<input type="file" accept="image/*" hidden></label>';

    const preview = slot.querySelector('.image-slot__preview');
    const fileInput = slot.querySelector('input[type="file"]');
    const key = 'gallery:' + index;
    setImage(key, url || '', preview);
    fileInput.addEventListener('change', () => handleFileChosen(key, fileInput, preview));

    galleryGrid.appendChild(slot);
  }

  // ---------- Areas ----------
  function addAreaChip(value) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML =
      '<input type="text" class="area-name" value="' + escapeAttr(value || '') + '" placeholder="Town">' +
      '<button type="button" class="chip__remove" title="Remove">&times;</button>';
    chip.querySelector('.chip__remove').addEventListener('click', () => chip.remove());
    areasList.appendChild(chip);
  }
  document.getElementById('addAreaBtn').addEventListener('click', () => addAreaChip(''));

  // ---------- Testimonials ----------
  function addTestimonialCard(t) {
    t = t || {};
    const card = document.createElement('div');
    card.className = 't-card';
    card.innerHTML =
      '<button type="button" class="t-card__remove" title="Remove">&times;</button>' +
      '<label>Name</label><input type="text" class="t-name" value="' + escapeAttr(t.name) + '">' +
      '<label>Area</label><input type="text" class="t-area" value="' + escapeAttr(t.area) + '">' +
      '<label>Review text</label><textarea class="t-text" rows="3">' + escapeHtml(t.text) + '</textarea>';
    card.querySelector('.t-card__remove').addEventListener('click', () => card.remove());
    testimonialsGrid.appendChild(card);
  }
  document.getElementById('addTestimonialBtn').addEventListener('click', () => addTestimonialCard({}));

  // ---------- Collect + Save ----------
  function collectForm() {
    const services = Array.from(servicesGrid.querySelectorAll('.svc-card')).map((card) => ({
      id: card.dataset.serviceId,
      name: card.querySelector('.svc-name').value.trim(),
      desc: card.querySelector('.svc-desc').value.trim(),
      image: imagePaths['service:' + card.dataset.serviceId] || '',
    }));

    const gallery = Array.from(galleryGrid.querySelectorAll('.image-slot')).map((slot) =>
      imagePaths['gallery:' + slot.dataset.galleryIndex] || ''
    ).filter(Boolean);

    const areas = Array.from(areasList.querySelectorAll('.area-name'))
      .map((input) => input.value.trim())
      .filter(Boolean);

    const testimonials = Array.from(testimonialsGrid.querySelectorAll('.t-card')).map((card) => ({
      name: card.querySelector('.t-name').value.trim(),
      area: card.querySelector('.t-area').value.trim(),
      text: card.querySelector('.t-text').value.trim(),
    })).filter((t) => t.name && t.text);

    return {
      whatsapp: whatsappInput.value.trim().replace(/[^\d]/g, ''),
      hero: {
        eyebrow: heroEyebrowInput.value.trim(),
        sub: heroSubInput.value.trim(),
        image: imagePaths.hero || '',
      },
      services,
      areas,
      testimonials,
      gallery,
    };
  }

  async function save() {
    const statusEls = [document.getElementById('saveStatus'), document.getElementById('saveStatusBottom')];
    const hasUploads = Object.keys(pendingUploads).length > 0;
    statusEls.forEach((el) => setStatus(el, hasUploads ? 'Uploading photos and saving...' : 'Saving...', null));

    try {
      const uploads = Object.values(pendingUploads).map((u) => ({ path: u.path, dataBase64: u.dataBase64 }));
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, content: collectForm(), uploads }),
      });
      const result = await res.json();

      if (res.ok && result.ok) {
        Object.keys(pendingUploads).forEach((k) => delete pendingUploads[k]);
        statusEls.forEach((el) => setStatus(el, 'Saved! Cloudflare will redeploy in about a minute.', 'success'));
      } else if (res.status === 401) {
        statusEls.forEach((el) => setStatus(el, 'Incorrect password — please log in again.', 'error'));
        sessionStorage.removeItem('las_admin_pw');
        showLogin();
      } else {
        statusEls.forEach((el) => setStatus(el, result.error || 'Could not save.', 'error'));
      }
    } catch {
      statusEls.forEach((el) => setStatus(el, 'Could not reach the server.', 'error'));
    }
  }

  document.getElementById('saveBtn').addEventListener('click', save);
  document.getElementById('saveBtnBottom').addEventListener('click', save);

  // ---------- Initial state ----------
  const savedPassword = sessionStorage.getItem('las_admin_pw');
  if (savedPassword) {
    password = savedPassword;
    fetchContent().then(populateForm).then(showDashboard).catch(showLogin);
  }
})();
