const universityId = window.location.pathname.split('/').filter(Boolean).pop();

const qs = (selector) => document.querySelector(selector);

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char];
  });

const safeUrl = (value) => {
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));

const createScoreText = (score) => `${Number(score || 0).toFixed(1)} / 5`;

const renderHero = (universite) => {
  const hero = qs('#universityHero');
  document.title = `${universite.ad} | UNIREHBER`;
  const web = safeUrl(universite.web);

  hero.innerHTML = `
    <p class="eyebrow">Universite profili</p>
    <h1>${escapeHtml(universite.ad)}</h1>
    <div class="detail-meta">
      <span>${escapeHtml(universite.sehir || 'Sehir yok')}</span>
      <span>${escapeHtml(universite.tur || 'Tur yok')}</span>
      <span>${createScoreText(universite.puan)}</span>
      <span>${universite.yorumSayisi} yorum</span>
    </div>
    ${web ? `<a class="primary-link" href="${web}" target="_blank" rel="noreferrer">Resmi siteye git</a>` : ''}
  `;
};

const renderComments = (comments) => {
  const list = qs('#commentList');

  if (!comments.length) {
    list.innerHTML = '<div class="empty-state">Bu universite icin henuz onaylanmis yorum yok.</div>';
    return;
  }

  list.innerHTML = comments
    .map(
      (comment) => `
        <article class="comment-row">
          <div class="comment-meta">
            <strong>${escapeHtml(comment.kullanici || 'anonim')}</strong>
            <span>${createScoreText(comment.puan)}</span>
          </div>
          <p>${escapeHtml(comment.yorum)}</p>
          <small>${formatDate(comment.tarih)}</small>
        </article>
      `
    )
    .join('');
};

const loadUniversity = async () => {
  const response = await fetch(`/api/universiteler/${universityId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Universite yuklenemedi.');
  }

  renderHero(data.universite);
  renderComments(data.yorumlar);
};

qs('#reviewForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formMessage = qs('#formMessage');
  const payload = Object.fromEntries(new FormData(form).entries());

  formMessage.textContent = 'Yorum gonderiliyor...';

  const response = await fetch(`/api/universiteler/${universityId}/yorumlar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  formMessage.textContent = data.message;

  if (response.ok) {
    form.reset();
  }
});

loadUniversity().catch((error) => {
  qs('#universityHero').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
});
