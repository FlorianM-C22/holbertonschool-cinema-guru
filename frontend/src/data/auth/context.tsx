import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { validateSession, clearAccessToken } from "./client"

interface AuthContextValue {
  isLoggedIn: boolean
  username: string
  isLoading: boolean
  refreshSession: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    const user = await validateSession()
    if (user) {
      setIsLoggedIn(true)
      setUsername(user.username)
    } else {
      setIsLoggedIn(false)
      setUsername("")
    }
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    setIsLoggedIn(false)
    setUsername("")
  }, [])

  useEffect(() => {
    let cancelled = false
    validateSession().then((user) => {
      if (cancelled) return
      if (user) {
        setIsLoggedIn(true)
        setUsername(user.username)
      } else {
        setIsLoggedIn(false)
        setUsername("")
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value: AuthContextValue = {
    isLoggedIn,
    username,
    isLoading,
    refreshSession,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx == null) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}

export { AuthProvider, useAuth }
