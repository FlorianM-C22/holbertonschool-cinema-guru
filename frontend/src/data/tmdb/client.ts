import { TMDB } from "@lorenzopant/tmdb"

const ENV_KEY = "VITE_TMDB_ACCESS_TOKEN"

let tmdbInstance: TMDB | null = null

function getAccessToken(): string {
  const token = import.meta.env[ENV_KEY]
  if (!token || typeof token !== "string") {
    throw new Error(
      `Missing or invalid ${ENV_KEY}. Add it to your .env file.`
    )
  }
  return token
}

function getTMDB(): TMDB {
  if (!tmdbInstance) {
    tmdbInstance = new TMDB(getAccessToken())
  }
  return tmdbInstance
}

export { getTMDB, getAccessToken }
