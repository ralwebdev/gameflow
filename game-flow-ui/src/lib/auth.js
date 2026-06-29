const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const TOKEN_STORAGE_KEY = 'cv_auth_token'
const USER_STORAGE_KEY = 'cv_auth_user'
const GUEST_STORAGE_KEY = 'cv_auth_guest'

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
}

export function getStoredUser() {
  return parseJson(localStorage.getItem(USER_STORAGE_KEY), null)
}

export function getStoredGuestState() {
  return localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
}

export function persistAuthSession({ token, user }) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  localStorage.setItem(GUEST_STORAGE_KEY, 'false')
}

export function persistGuestSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.setItem(GUEST_STORAGE_KEY, 'true')
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(GUEST_STORAGE_KEY)
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.')
  }

  return data
}

export async function signUp(input) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function signIn(input) {
  return request('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function fetchCurrentUser(token) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
