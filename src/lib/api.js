import { session } from './session';

async function refreshAccessToken() {
  const state = session.get();
  if (!state.refreshToken) return false;

  try {
    const response = await fetch(`${state.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(state.turnstileToken ? { 'X-Turnstile-Token': state.turnstileToken } : {})
      },
      body: JSON.stringify({ refresh_token: state.refreshToken })
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      session.clearAuth();
      return false;
    }

    session.setAuth(payload.data);
    return true;
  } catch (error) {
    session.clearAuth();
    return false;
  }
}

async function request(path, options = {}, retry = true) {
  const state = session.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(state.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {}),
    ...(state.turnstileToken ? { 'X-Turnstile-Token': state.turnstileToken } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${state.apiBaseUrl}${path}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      const rawText = await response.text();

      if (!response.ok) {
        const looksLikeHtml = rawText.trim().startsWith('<');
        const message = looksLikeHtml
          ? `API mengembalikan HTML, bukan JSON. Periksa VITE_API_BASE_URL (${state.apiBaseUrl}) dan pastikan backend yang benar sedang berjalan.`
          : rawText || 'Response tidak valid dari server';
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      payload = { success: false, message: 'Response tidak valid dari server' };
    }

    const shouldTryRefresh =
      retry &&
      response.status === 401 &&
      state.refreshToken &&
      !path.startsWith('/auth/refresh') &&
      !path.startsWith('/auth/login') &&
      !path.startsWith('/auth/register');

    if (shouldTryRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request(path, options, false);
      }
    }

    if (!response.ok || !payload.success) {
      const error = new Error(payload.message || 'Terjadi kesalahan');
      error.response = payload;
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Tidak bisa terhubung ke API di ${state.apiBaseUrl}. Pastikan backend sedang berjalan.`);
    }
    throw error;
  }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body = {}) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  patch: (path, body = {}) =>
    request(path, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  delete: (path) => request(path, { method: 'DELETE' })
};
