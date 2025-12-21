"use client"

import * as React from "react"
import { Bell, Sun, Moon, LogOut, User, Settings, CreditCard } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"
import { useUIStore } from "@/stores/ui-store"

interface HeaderProps {
  breadcrumb?: string[]
  className?: string
}

export function Header({ breadcrumb = ["Dashboard"], className }: HeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useUIStore()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleSignOut = () => {
    logout()
    navigate("/login")
  }

  // Get user initials for avatar fallback
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 hidden h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:flex",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-4 px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <span
                className={cn({
                  "font-medium": index === breadcrumb.length - 1,
                  "text-muted-foreground": index !== breadcrumb.length - 1,
                })}
              >
                {item}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-10 w-10"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <Separator />
            <div className="max-h-[400px] overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-medium">Notification {i}</p>
                  <p className="text-xs text-muted-foreground">
                    This is a sample notification message
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left text-sm xl:flex">
                <span className="font-medium">{user?.name || "Usuário"}</span>
                <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/billing')}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <Separator className="my-1" />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

Header.displayName = "Header"
