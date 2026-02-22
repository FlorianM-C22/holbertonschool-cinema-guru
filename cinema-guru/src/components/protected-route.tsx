import { Navigate } from "react-router-dom"
import { useAuth } from "@/data/auth/context"

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export { ProtectedRoute }
