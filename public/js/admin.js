const STATUS_APPROVED = 'onayland\u0131';
const STATUS_PENDING = 'beklemede';
const STATUS_REJECTED = 'reddedildi';

let activeStatus = STATUS_PENDING;

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

const statusLabels = {
  [STATUS_PENDING]: 'Beklemede',
  [STATUS_APPROVED]: 'Onaylandi',
  [STATUS_REJECTED]: 'Reddedildi'
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));

const showAdmin = (isAdmin) => {
  qs('#loginPanel').classList.toggle('hidden', isAdmin);
  qs('#adminShell').classList.toggle('hidden', !isAdmin);
  qs('#logoutButton').classList.toggle('hidden', !isAdmin);
};

const api = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Islem basarisiz.');
  }

  return data;
};

const renderComments = (comments) => {
  const wrapper = qs('#adminComments');

  if (!comments.length) {
    wrapper.innerHTML = '<div class="empty-state">Bu durumda yorum yok.</div>';
    return;
  }

  wrapper.innerHTML = comments
    .map(
      (comment) => `
        <article class="admin-comment">
          <div class="comment-meta">
            <strong>${escapeHtml(comment.universite?.ad || 'Universite bulunamadi')}</strong>
            <span>${escapeHtml(statusLabels[comment.durum] || comment.durum)}</span>
          </div>
          <p>${escapeHtml(comment.yorum)}</p>
          <small>${escapeHtml(comment.kullanici || 'anonim')} · ${comment.puan}/5 · ${formatDate(comment.tarih)}</small>
          <div class="admin-actions">
            <button class="success-button" data-action="approve" data-id="${comment.id}" type="button">Onayla</button>
            <button class="warning-button" data-action="reject" data-id="${comment.id}" type="button">Reddet</button>
            <button class="danger-button" data-action="delete" data-id="${comment.id}" type="button">Sil</button>
          </div>
        </article>
      `
    )
    .join('');
};

const loadComments = async () => {
  const query = activeStatus === 'tum' ? '' : `?durum=${encodeURIComponent(activeStatus)}`;
  const comments = await api(`/api/admin/yorumlar${query}`);
  renderComments(comments);
};

qs('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = new FormData(event.currentTarget).get('password');
  const message = qs('#loginMessage');

  try {
    await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    showAdmin(true);
    await loadComments();
  } catch (error) {
    message.textContent = error.message;
  }
});

qs('#logoutButton').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' });
  showAdmin(false);
});

qs('#adminShell').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === 'delete') {
    await api(`/api/admin/yorumlar/${id}`, { method: 'DELETE' });
  } else {
    await api(`/api/admin/yorumlar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        durum: action === 'approve' ? STATUS_APPROVED : STATUS_REJECTED
      })
    });
  }

  await loadComments();
});

document.querySelectorAll('.tab-button').forEach((button) => {
  button.addEventListener('click', async () => {
    document.querySelectorAll('.tab-button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeStatus = button.dataset.status;
    await loadComments();
  });
});

const init = async () => {
  const session = await api('/api/admin/me');
  showAdmin(session.isAdmin);

  if (session.isAdmin) {
    await loadComments();
  }
};

init().catch(() => showAdmin(false));
