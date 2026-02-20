import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export { ProtectedRoute }
