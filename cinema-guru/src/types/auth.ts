/** Auth-related type definitions (request/response and session). */
/** Credentials sent to login and register endpoints */
export type AuthCredentials = {
  username: string
  password: string
}

/** Response from POST /api/auth/login and POST /api/auth/register */
export type AuthTokenResponse = {
  accessToken: string
}

/** User returned by session validation (POST /api/auth/ with Bearer token) */
export type AuthUser = {
  username: string
}
