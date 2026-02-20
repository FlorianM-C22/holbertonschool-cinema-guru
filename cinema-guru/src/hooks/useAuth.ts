import { useCallback, useEffect, useState } from "react"

import { validateSession, clearAccessToken } from "@/lib/auth"

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")

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
    refreshSession()
  }, [refreshSession])

  return { isLoggedIn, username, refreshSession, logout }
}

export { useAuth }
