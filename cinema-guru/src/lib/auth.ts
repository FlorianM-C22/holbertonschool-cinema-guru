import * as authApi from "@/api/auth"
import type { AuthCredentials, AuthUser } from "@/types/auth"

const ACCESS_TOKEN_KEY = "accessToken"
const SESSION_URL = "/api/auth/"

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

async function login(credentials: AuthCredentials): Promise<void> {
  const { accessToken } = await authApi.login(credentials)
  setAccessToken(accessToken)
}

async function register(credentials: AuthCredentials): Promise<void> {
  const { accessToken } = await authApi.register(credentials)
  setAccessToken(accessToken)
}

async function validateSession(): Promise<AuthUser | null> {
  const token = getAccessToken()
  if (!token) return null

  const res = await fetch(SESSION_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  })
  if (!res.ok) return null

  const text = await res.text()
  if (!text.trim()) return null
  try {
    const data = JSON.parse(text) as { userId?: number; username?: string }
    if (!data.username) return null
    return { username: data.username }
  } catch {
    return null
  }
}

export {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  validateSession,
  login,
  register,
}
export type { AuthUser }
