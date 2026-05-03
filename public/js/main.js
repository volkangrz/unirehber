const state = {
  universities: [],
  filters: {
    sehirler: [],
    turler: []
  }
};

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

const createStars = (score) => {
  const value = Number(score || 0);
  return `${value.toFixed(1)} / 5`;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));

const setLoading = (element, message) => {
  element.innerHTML = `<div class="empty-state">${message}</div>`;
};

const loadFilters = async () => {
  const response = await fetch('/api/universiteler/filtreler');
  state.filters = await response.json();

  const cityFilter = qs('#cityFilter');
  const typeFilter = qs('#typeFilter');

  state.filters.sehirler.forEach((city) => {
    cityFilter.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`);
  });

  state.filters.turler.forEach((type) => {
    typeFilter.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`);
  });

  qs('#metricCity').textContent = state.filters.sehirler.length;
};

const renderUniversities = (universities) => {
  const list = qs('#universityList');
  qs('#metricUniversity').textContent = universities.length;

  if (!universities.length) {
    setLoading(list, 'Bu filtrelerle universite bulunamadi.');
    return;
  }

  list.innerHTML = universities
    .map((uni) => {
      const web = safeUrl(uni.web);
      return `
        <article class="university-row">
          <div>
            <a class="university-title" href="/universite/${encodeURIComponent(uni.id)}">${escapeHtml(uni.ad)}</a>
            <p>${escapeHtml(uni.sehir || 'Sehir yok')} · ${escapeHtml(uni.tur || 'Tur yok')}</p>
            ${web ? `<a class="web-link" href="${web}" target="_blank" rel="noreferrer">${escapeHtml(uni.web)}</a>` : ''}
          </div>
          <div class="score-block">
            <strong>${createStars(uni.puan)}</strong>
            <span>${uni.yorumSayisi} yorum</span>
          </div>
        </article>
      `;
    })
    .join('');
};

const loadUniversities = async () => {
  const params = new URLSearchParams();
  const q = qs('#searchInput').value.trim();
  const sehir = qs('#cityFilter').value;
  const tur = qs('#typeFilter').value;
  const sort = qs('#sortFilter').value;

  if (q) params.set('q', q);
  if (sehir) params.set('sehir', sehir);
  if (tur) params.set('tur', tur);
  if (sort) params.set('sort', sort);

  const list = qs('#universityList');
  setLoading(list, 'Universiteler yukleniyor...');

  const response = await fetch(`/api/universiteler?${params.toString()}`);
  const universities = await response.json();
  state.universities = universities;
  renderUniversities(universities);
};

const loadPopular = async () => {
  const response = await fetch('/api/universiteler/populer');
  const items = await response.json();
  const popularList = qs('#popularList');

  if (!items.length) {
    setLoading(popularList, 'Henuz populer veri olusmadi.');
    return;
  }

  popularList.innerHTML = items
    .map(
      (item) => `
        <a class="compact-item" href="/universite/${encodeURIComponent(item.id)}">
          <strong>${escapeHtml(item.ad)}</strong>
          <span>${escapeHtml(item.sehir || 'Sehir yok')} · ${item.yorumSayisi} yorum</span>
        </a>
      `
    )
    .join('');
};

const loadLatestComments = async () => {
  const response = await fetch('/api/yorumlar/son');
  const comments = await response.json();
  const wrapper = qs('#latestComments');

  if (!comments.length) {
    setLoading(wrapper, 'Onaylanmis yorum bekleniyor.');
    return;
  }

  wrapper.innerHTML = comments
    .map(
      (comment) => `
        <article class="comment-card">
          <div class="comment-meta">
            <strong>${escapeHtml(comment.universite?.ad || 'Universite')}</strong>
            <span>${createStars(comment.puan)}</span>
          </div>
          <p>${escapeHtml(comment.yorum)}</p>
          <small>${escapeHtml(comment.kullanici || 'anonim')} · ${formatDate(comment.tarih)}</small>
        </article>
      `
    )
    .join('');
};

qs('#searchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  loadUniversities();
});

['#cityFilter', '#typeFilter', '#sortFilter'].forEach((selector) => {
  qs(selector).addEventListener('change', loadUniversities);
});

let searchTimer;
qs('#searchInput').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadUniversities, 250);
});

const init = async () => {
  await loadFilters();
  await Promise.all([loadUniversities(), loadPopular(), loadLatestComments()]);
};

init().catch((error) => {
  console.error(error);
  setLoading(qs('#universityList'), 'Veri yuklenirken hata olustu.');
});
