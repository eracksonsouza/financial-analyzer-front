export interface UserProfile {
  name: string
  email: string
}

const TOKEN_KEYS = ['auth_token', 'jwt', 'token']

function decodePayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getUserProfile(): UserProfile | null {
  const token = TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
  if (!token) return null

  const payload = decodePayload(token)
  if (!payload) return null

  const name = typeof payload.name === 'string' ? payload.name : undefined
  const email = typeof payload.email === 'string' ? payload.email : undefined

  if (!name || !email) return null

  return { name, email }
}
