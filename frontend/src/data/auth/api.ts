import type { AuthCredentials, AuthTokenResponse } from "./types"

const LOGIN_URL = "/api/auth/login"
const REGISTER_URL = "/api/auth/register"

async function handleAuthResponse(
  res: Response,
  fallbackError: string
): Promise<AuthTokenResponse> {
  const text = await res.text()
  if (!text.trim()) {
    throw new Error(
      res.ok ? fallbackError : `Request failed: ${res.status} ${res.statusText}`
    )
  }
  let data: { message?: string; accessToken?: string }
  try {
    data = JSON.parse(text) as { message?: string; accessToken?: string }
  } catch {
    throw new Error(
      res.ok
        ? fallbackError
        : `Request failed: ${res.status} ${res.statusText}. Response: ${text.substring(0, 100)}`
    )
  }
  if (!res.ok) {
    throw new Error(data.message ?? fallbackError)
  }
  if (!data.accessToken) {
    throw new Error(fallbackError)
  }
  return { accessToken: data.accessToken }
}

export async function login(credentials: AuthCredentials): Promise<AuthTokenResponse> {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })
  return handleAuthResponse(res, "Login failed")
}

export async function register(credentials: AuthCredentials): Promise<AuthTokenResponse> {
  const res = await fetch(REGISTER_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })
  return handleAuthResponse(res, "Registration failed")
}
