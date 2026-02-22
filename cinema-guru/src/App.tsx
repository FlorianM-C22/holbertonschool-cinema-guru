import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/data/auth/context"
import { AuthForm } from "./components/auth/auth-form"
import { Home } from "./pages/home"
import { ProtectedRoute } from "./components/protected-route"
import loginBg from "./assets/login-bg.jpg"


function AuthPage() {
  const { refreshSession } = useAuth()

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-10 p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <AuthForm onSuccess={refreshSession} />
    </main>
  )
}

function App() {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/home" replace /> : <AuthPage />
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
