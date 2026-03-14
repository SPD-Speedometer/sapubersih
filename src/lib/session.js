import { writable, get } from 'svelte/store';

const defaultSession = {
  user: null,
  accessToken: '',
  refreshToken: '',
  expiresIn: 0,
  turnstileToken: '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://be-sampah.radiatorsprings.id/api/v1'
};

function createSessionStore() {
  const store = writable(loadSession());

  store.subscribe((value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sapu_session', JSON.stringify(value));
    }
  });

  return {
    subscribe: store.subscribe,
    setAuth(authPayload) {
      store.update((state) => ({
        ...state,
        user: authPayload.user,
        accessToken: authPayload.access_token,
        refreshToken: authPayload.refresh_token,
        expiresIn: authPayload.expires_in
      }));
    },
    setUser(user) {
      store.update((state) => ({ ...state, user }));
    },
    setTurnstileToken(token) {
      store.update((state) => ({ ...state, turnstileToken: token }));
    },
    setApiBaseUrl(apiBaseUrl) {
      store.update((state) => ({ ...state, apiBaseUrl }));
    },
    clearAuth() {
      store.update((state) => ({
        ...state,
        user: null,
        accessToken: '',
        refreshToken: '',
        expiresIn: 0
      }));
    },
    reset() {
      store.set(defaultSession);
    },
    get() {
      return get(store);
    }
  };
}

function loadSession() {
  const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultSession.apiBaseUrl;

  if (typeof window === 'undefined') {
    return { ...defaultSession, apiBaseUrl: envApiBaseUrl };
  }

  const raw = localStorage.getItem('sapu_session');
  if (!raw) {
    return { ...defaultSession, apiBaseUrl: envApiBaseUrl };
  }

  try {
    const parsed = JSON.parse(raw);
    return { ...defaultSession, ...parsed, apiBaseUrl: envApiBaseUrl };
  } catch (error) {
    return { ...defaultSession, apiBaseUrl: envApiBaseUrl };
  }
}

export const session = createSessionStore();
