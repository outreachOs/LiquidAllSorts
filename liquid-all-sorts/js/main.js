// Liquid All Sorts — site behaviour

document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const headerCta = document.querySelector('.header-cta');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu after tapping a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Contact / quote form -> opens WhatsApp with the enquiry pre-filled
  const WHATSAPP_NUMBER = '447777213180';
  const form = document.getElementById('quoteForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        service: form.service.value,
        area: form.area.value.trim(),
        message: form.message.value.trim(),
      };

      if (!data.name || !data.phone || !data.service) {
        setStatus('Please fill in your name, phone number and service.', 'error');
        return;
      }

      const lines = [
        `Hi Liquid All Sorts, I'd like a quote.`,
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        data.email ? `Email: ${data.email}` : null,
        `Service: ${data.service}`,
        data.area ? `Area/Postcode: ${data.area}` : null,
        data.message ? `Details: ${data.message}` : null,
      ].filter(Boolean).join('\n');

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;

      setStatus('Opening WhatsApp with your enquiry ready to send...', 'success');
      window.open(waUrl, '_blank', 'noopener');
    });
  }

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.remove('is-success', 'is-error');
    if (type === 'success') statusEl.classList.add('is-success');
    if (type === 'error') statusEl.classList.add('is-error');
  }
});
