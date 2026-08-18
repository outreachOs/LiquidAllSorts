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

  // Contact / quote form -> Cloudflare Pages Function -> Telegram
  const form = document.getElementById('quoteForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
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

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      setStatus('', '');

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await res.json().catch(() => ({}));

        if (res.ok && result.ok) {
          form.reset();
          setStatus('Thanks — your enquiry has been sent. We\'ll be in touch shortly, or call 07777 213180 for an instant answer.', 'success');
        } else {
          // Telegram not configured yet, or a delivery issue — fail gracefully
          setStatus('We couldn\'t send that automatically. Please call or text 07777 213180 and we\'ll sort your quote directly.', 'error');
        }
      } catch (err) {
        setStatus('We couldn\'t send that automatically. Please call or text 07777 213180 and we\'ll sort your quote directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Enquiry';
      }
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
