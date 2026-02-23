import { getAccessToken } from "@/data/auth/client"

const API_BASE = "/api"

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken()
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = new Error(res.statusText)
    ;(err as Error & { status: number }).status = res.status
    throw err
  }
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = new Error(res.statusText)
    ;(err as Error & { status: number }).status = res.status
    throw err
  }
  return res.json() as Promise<T>
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = new Error(res.statusText)
    ;(err as Error & { status: number }).status = res.status
    throw err
  }
  return res.json() as Promise<T>
}
