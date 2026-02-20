import { useState } from "react"
import { Search, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { SearchBar } from "@/components/ui/search-bar"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

function Navbar() {
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const { username, logout } = useAuth()
  const navigate = useNavigate()

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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="h-9 w-9"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <AnimatedThemeToggler className="h-9 w-9" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
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
                    {username && (
                      <p className="font-medium">{username}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isSearchVisible 
            ? "max-h-96 opacity-100 pb-4 translate-y-0" 
            : "max-h-0 opacity-0 pb-0 -translate-y-2"
        )}>
          <SearchBar />
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
