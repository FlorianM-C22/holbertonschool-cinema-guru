import { useRef, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Search, LogOut, Check } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import logo from "@/assets/logo.png"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { SearchBar } from "@/components/ui/search-bar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/data/auth/context"
import { cn } from "@/lib/utils"
import type { MovieCategory, TvCategory } from "@/data/tmdb/types"

const SCROLL_THRESHOLD_PX = 24
const HOVER_CLOSE_DELAY_MS = 150

const MOVIE_CATEGORY_VALUES: MovieCategory[] = ["popular", "upcoming", "top_rated"]
const TV_CATEGORY_VALUES: TvCategory[] = ["popular", "upcoming", "top_rated"]

function Navbar() {
  const { t, i18n } = useTranslation()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [moviesOpen, setMoviesOpen] = useState(false)
  const [tvOpen, setTvOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const scheduleClose = (setOpen: (v: boolean) => void) => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(
      () => setOpen(false),
      HOVER_CLOSE_DELAY_MS,
    )
  }

  const handleViewChange = (
    view: "movies" | "tv",
    category: MovieCategory | TvCategory,
  ) => {
    setSearchParams({ view, category })
    setMoviesOpen(false)
    setTvOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleSearch = () => {
    setIsSearchVisible((prev) => !prev)
  }

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300 ease-out",
        isScrolled
          ? "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-background/20 backdrop-blur-sm",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/home"
            className="flex items-center shrink-0 mr-15"
            aria-label={t("nav.aria.home")}
          >
            <img src={logo} alt="Cinema Guru" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/home"
              className="text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
            >
              {t("nav.home")}
            </Link>
            <DropdownMenu open={moviesOpen} onOpenChange={setMoviesOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-sm font-medium text-foreground/90 transition-colors hover:text-foreground outline-none"
                  onMouseEnter={() => {
                    clearCloseTimeout()
                    setTvOpen(false)
                    setMoviesOpen(true)
                  }}
                  onMouseLeave={() => scheduleClose(setMoviesOpen)}
                >
                  {t("nav.movies")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={() => clearCloseTimeout()}
                onMouseLeave={() => scheduleClose(setMoviesOpen)}
              >
                {MOVIE_CATEGORY_VALUES.map((value) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handleViewChange("movies", value)}
                  >
                    {t(`nav.categories.${value}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu open={tvOpen} onOpenChange={setTvOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-sm font-medium text-foreground/90 transition-colors hover:text-foreground outline-none"
                  onMouseEnter={() => {
                    clearCloseTimeout()
                    setMoviesOpen(false)
                    setTvOpen(true)
                  }}
                  onMouseLeave={() => scheduleClose(setTvOpen)}
                >
                  {t("nav.tvShows")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={() => clearCloseTimeout()}
                onMouseLeave={() => scheduleClose(setTvOpen)}
              >
                {TV_CATEGORY_VALUES.map((value) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handleViewChange("tv", value)}
                  >
                    {t(`nav.categories.${value}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div
              className="h-4 w-px shrink-0 bg-border"
              role="separator"
              aria-hidden
            />
            <Link
              to="/favorites"
              className="text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
            >
              {t("nav.favourites")}
            </Link>
            <Link
              to="/watch-later"
              className="text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
            >
              {t("nav.watchLater")}
            </Link>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out",
                isSearchVisible ? "max-w-xl opacity-100" : "max-w-0 opacity-0",
              )}
            >
              <div
                className={cn(
                  "w-[22rem] transition-transform duration-300 ease-in-out",
                  isSearchVisible ? "translate-x-0" : "translate-x-4",
                )}
              >
                <SearchBar
                  className="w-full"
                  onSearch={(value) => {
                    const trimmed = value.trim()
                    if (trimmed.length === 0) return
                    const params = new URLSearchParams()
                    params.set("q", trimmed)
                    params.set("type", "all")
                    navigate(`/search?${params.toString()}`)
                  }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="h-9 w-9 shrink-0"
              aria-label={t("nav.aria.toggleSearch")}
            >
              <Search className="h-5 w-5" />
            </Button>

            <AnimatedThemeToggler className="h-9 w-9" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {username ? getInitials(username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {username && <p className="font-medium">{username}</p>}
                  </div>
                </div>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage("fr")}
                  className={i18n.language === "fr" ? "bg-accent" : undefined}
                >
                  {i18n.language === "fr" && <Check className="mr-2 h-4 w-4" />}
                  <span className={i18n.language !== "fr" ? "ml-6" : undefined}>
                    {t("nav.langFr")}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage("en")}
                  className={i18n.language === "en" ? "bg-accent" : undefined}
                >
                  {i18n.language === "en" && <Check className="mr-2 h-4 w-4" />}
                  <span className={i18n.language !== "en" ? "ml-6" : undefined}>
                    {t("nav.langEn")}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("nav.logOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
