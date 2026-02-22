# Holberton Cinema Guru

React (Vite + TypeScript) frontend for the Cinema Guru application.

---

## Data access layer (reference)

All server and client-side data access lives under **`cinema-guru/src/data/`**. Each domain (e.g. auth, future: movies) has its own folder with the same four-file layout. There are **no index files**; imports point directly at the module files.

### Per-domain layout: `src/data/<domain>/`

| File              | Role                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`types.ts`**    | TypeScript types for requests, responses, and domain entities.                                                                                                            |
| **`api.ts`**      | Raw HTTP: `fetch` calls to backend endpoints. No token handling; returns/throws.                                                                                          |
| **`client.ts`**   | Orchestration: uses `api.ts`, handles tokens/storage, session validation. Exposes high-level functions (e.g. `login`, `register`, `validateSession`, `clearAccessToken`). |
| **`context.tsx`** | React state: `createContext`, provider component, and `useX` hook. Uses the client for initial load and actions; exposes loading state and methods to the UI.             |

### Auth domain: `src/data/auth/`

- **`types.ts`**
  - `AuthCredentials` (username, password)
  - `AuthTokenResponse` (accessToken)
  - `AuthUser` (username from session)

- **`api.ts`**
  - `login(credentials)` → POST `/api/auth/login`
  - `register(credentials)` → POST `/api/auth/register`
  - Returns `AuthTokenResponse`; throws on error.

- **`client.ts`**
  - Token in `localStorage` key `accessToken`.
  - `login(credentials)`, `register(credentials)` — call api then store token.
  - `validateSession()` — POST `/api/auth/` with Bearer token; returns `AuthUser | null`.
  - `getAccessToken()`, `setAccessToken()`, `clearAccessToken()`.

- **`context.tsx`**
  - `AuthProvider`: on mount runs `validateSession()` once, sets `isLoading` to false when done.
  - `useAuth()`: `{ isLoggedIn, username, isLoading, refreshSession, logout }`.
  - Must be used inside `AuthProvider`.

### Import paths (no index)

- `AuthProvider`, `useAuth` → `@/data/auth/context`
- `login`, `register`, token/session helpers → `@/data/auth/client`
- `AuthCredentials`, `AuthUser`, `AuthTokenResponse` → `@/data/auth/types`

### Adding a new data domain (e.g. movies)

1. Create `src/data/movies/` with `types.ts`, `api.ts`, `client.ts`, and optionally `context.tsx`.
2. In **api.ts**: define `fetch` calls to the backend (e.g. GET/POST `/api/movies/...`).
3. In **client.ts**: import from `./api` and `./types`; add caching, auth headers, or other orchestration; export functions used by the app.
4. In **context.tsx** (if needed): create a provider and a `useMovies()` (or similar) that uses the client and exposes state + loading.
5. In components: import from `@/data/movies/context`, `@/data/movies/client`, or `@/data/movies/types` as needed — no index re-exports.

---

## Run

From repo root:

```bash
cd cinema-guru
npm install
npm run dev
```

Build: `npm run build`.
