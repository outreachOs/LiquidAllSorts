// This is now a full Worker (not "static assets only"), which is what
// makes environment variables available. Everything except /api/save
// is just handed straight to the static files in this repo.
//
// Set two environment variables in Cloudflare dashboard -> your Worker
// -> Settings -> Variables and Secrets (nothing else needed):
//   ADMIN_PASSWORD   whatever short password your friend logs in with
//   GITHUB_TOKEN     a GitHub fine-grained token, scoped to only this repo,
//                    with Contents set to Read and write (see README section 5)

const GITHUB_OWNER = 'outreachOs';
const GITHUB_REPO = 'LiquidAllSorts';
const GITHUB_BRANCH = 'main';
const CONTENT_PATH = 'content.json';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/save' && request.method === 'POST') {
      return handleSave(request, env);
    }

    // Everything else: serve the static site as-is.
    return env.ASSETS.fetch(request);
  },
};

async function handleSave(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
    return json(
      { ok: false, error: 'Saving isn\'t set up yet — ADMIN_PASSWORD and GITHUB_TOKEN need adding in the Worker\'s Variables and Secrets.' },
      200
    );
  }

  if (body.password !== env.ADMIN_PASSWORD) {
    return json({ ok: false, error: 'Incorrect password.' }, 401);
  }

  const content = sanitize(body.content);
  if (!content) {
    return json({ ok: false, error: 'That content didn\'t look right — nothing was saved.' }, 400);
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}`;
  const ghHeaders = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'liquid-all-sorts-admin',
  };

  try {
    // Upload any new images first — each becomes its own small commit.
    const uploads = Array.isArray(body.uploads) ? body.uploads.slice(0, 20) : [];
    for (const upload of uploads) {
      const uploadOk = await uploadImage(upload, ghHeaders);
      if (!uploadOk) {
        return json({ ok: false, error: `Could not upload image "${upload && upload.path}".` }, 200);
      }
    }

    const getRes = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (!getRes.ok) {
      return json({ ok: false, error: 'Could not read the current file from GitHub.' }, 200);
    }
    const current = await getRes.json();

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update site content via admin dashboard',
        content: base64EncodeUtf8(JSON.stringify(content, null, 2)),
        sha: current.sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!putRes.ok) {
      const errBody = await putRes.json().catch(() => ({}));
      return json({ ok: false, error: errBody.message || 'GitHub rejected the save.' }, 200);
    }

    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'Could not reach GitHub.' }, 200);
  }
}

function base64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

async function uploadImage(upload, ghHeaders) {
  if (!upload || typeof upload !== 'object') return false;
  const path = safeUploadPath(upload.path);
  const data = typeof upload.dataBase64 === 'string' ? upload.dataBase64 : '';
  if (!path || !data || data.length > 8_000_000) return false; // ~6MB raw image cap

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  try {
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Upload image via admin dashboard: ${path}`,
        content: data,
        branch: GITHUB_BRANCH,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Only ever allow writing inside uploads/, with a safe filename — the
// path is generated client-side but this is the real enforcement point.
function safeUploadPath(path) {
  if (typeof path !== 'string') return null;
  const cleaned = path.replace(/[^a-zA-Z0-9/_.-]/g, '');
  if (!cleaned.startsWith('uploads/')) return null;
  if (cleaned.includes('..')) return null;
  return cleaned.slice(0, 200);
}

function str(v, max = 2000) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function isImagePath(v) {
  const s = str(v, 500);
  return /^https?:\/\//.test(s) || /^uploads\//.test(s) ? s : '';
}

function sanitize(body) {
  if (!body || typeof body !== 'object') return null;
  try {
    const whatsapp = str(body.whatsapp, 20).replace(/[^\d]/g, '');
    if (!whatsapp || whatsapp.length < 8) return null;

    const hero = {
      eyebrow: str(body.hero && body.hero.eyebrow, 120),
      sub: str(body.hero && body.hero.sub, 400),
      image: isImagePath(body.hero && body.hero.image),
    };

    const services = Array.isArray(body.services)
      ? body.services.slice(0, 12).map((s) => ({
          id: str(s.id, 60),
          name: str(s.name, 120),
          desc: str(s.desc, 400),
          image: isImagePath(s.image),
        })).filter((s) => s.id)
      : [];

    const areas = Array.isArray(body.areas)
      ? body.areas.map((a) => str(a, 60)).filter(Boolean).slice(0, 60)
      : [];

    const testimonials = Array.isArray(body.testimonials)
      ? body.testimonials.slice(0, 24).map((t) => ({
          name: str(t.name, 80),
          area: str(t.area, 60),
          text: str(t.text, 600),
        })).filter((t) => t.name && t.text)
      : [];

    const gallery = Array.isArray(body.gallery)
      ? body.gallery.map((g) => isImagePath(g)).filter(Boolean).slice(0, 8)
      : [];

    return { whatsapp, hero, services, areas, testimonials, gallery };
  } catch {
    return null;
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
