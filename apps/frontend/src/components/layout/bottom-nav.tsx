"use client"

import * as React from "react"
import { Home, Building2, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Building2, label: "Workspaces", href: "/settings/workspaces" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
]

interface BottomNavProps {
  currentPath?: string
  className?: string
}

export function BottomNav({ currentPath = "/", className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden",
        className
      )}
    >
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.href

          return (
            <motion.a
              key={item.href}
              href={item.href}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex h-11 min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg px-3 transition-colors hover:bg-accent",
                {
                  "text-primary": isActive,
                  "text-muted-foreground": !isActive,
                }
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </motion.a>
          )
        })}
      </div>
    </nav>
  )
}

BottomNav.displayName = "BottomNav"
