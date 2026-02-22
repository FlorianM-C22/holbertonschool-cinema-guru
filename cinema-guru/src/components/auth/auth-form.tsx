import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login as loginAuth, register } from "@/data/auth/client"
import type { AuthCredentials } from "@/data/auth/types"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "signup"

type AuthFormProps = {
  onSuccess?: () => void
}

const inputClassName =
  "h-12 rounded-xl border px-4 text-base transition-[color,box-shadow]"

function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSignup = mode === "signup"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const loginTrimmed = login.trim()
    const passwordTrimmed = password.trim()

    if (!loginTrimmed) {
      setError("Email or username is required.")
      return
    }
    if (!passwordTrimmed) {
      setError("Password is required.")
      return
    }
    if (isSignup) {
      if (passwordTrimmed.length < 8) {
        setError("Password must be at least 8 characters.")
        return
      }
      if (passwordTrimmed !== confirmPassword.trim()) {
        setError("Passwords do not match.")
        return
      }
    }

    setIsLoading(true)
    try {
      const credentials: AuthCredentials = {
        username: loginTrimmed,
        password: passwordTrimmed,
      }
      if (isSignup) {
        await register(credentials)
      } else {
        await loginAuth(credentials)
      }
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  function switchMode() {
    setMode((m) => (m === "login" ? "signup" : "login"))
    setError(null)
  }

  return (
    <Card className="w-full max-w-[440px] border-border/80 bg-card/80 px-8 py-8 shadow-xl backdrop-blur-xl sm:px-10 sm:py-10">
      <CardHeader className="px-0 pb-2 pt-0">
        <CardTitle className="text-2xl tracking-tight">
          {isSignup ? "Create account" : "Log in"}
        </CardTitle>
        <CardDescription className="mt-1.5 text-base">
          {isSignup
            ? "Sign up to save your watchlist and preferences."
            : "Enter your credentials to continue."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-6 px-0 pb-0 pt-6">
          <div className="flex flex-col gap-3">
            <Label htmlFor="auth-login" className="text-base font-medium">
              Email or username
            </Label>
            <Input
              id="auth-login"
              type="text"
              autoComplete={isSignup ? "username" : "username email"}
              placeholder="you@example.com"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!error}
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="auth-password" className="text-base font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                aria-invalid={!!error}
                className={cn(inputClassName, "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="text-primary/80 hover:text-primary absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>
          {isSignup && (
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="auth-confirm-password"
                className="text-base font-medium"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!error}
                  className={cn(inputClassName, "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  disabled={isLoading}
                  className="text-primary/80 hover:text-primary absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>
          )}
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-5 border-t border-border/60 px-0 pt-8">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full rounded-xl px-6"
          >
            {isLoading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  disabled={isLoading}
                  className="text-foreground font-medium underline-offset-4 hover:underline"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  disabled={isLoading}
                  className="text-foreground font-medium underline-offset-4 hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export { AuthForm }
