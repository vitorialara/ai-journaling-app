"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, BarChart, Calendar, Settings, LogOut, User, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Debug flag
const DEBUG = true

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, isLoading, isMockAuth } = useAuth()

  // Don't show navbar on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8" variant="minimal" />
          <span className="font-semibold text-purple-800">feel-write</span>
          {/* {isMockAuth && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full flex items-center">
              <AlertTriangle className="h-3 w-3 mr-0.5" />
              Preview
            </span>
          )} */}
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={`hidden md:flex ${pathname === "/" ? "bg-purple-100 text-purple-800" : ""}`}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${pathname === "/" ? "bg-purple-100 text-purple-800" : ""}`}
            >
              <Home className="w-5 h-5" />
            </Button>
          </Link>

          <Link href="/emotions">
            <Button
              variant="ghost"
              size="sm"
              className={`hidden md:flex ${pathname?.startsWith("/emotions") ? "bg-purple-100 text-purple-800" : ""}`}
            >
              Check-in
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${pathname?.startsWith("/emotions") ? "bg-purple-100 text-purple-800" : ""}`}
            >
              <Calendar className="w-5 h-5" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className={`hidden md:flex ${pathname === "/dashboard" ? "bg-purple-100 text-purple-800" : ""}`}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${pathname === "/dashboard" ? "bg-purple-100 text-purple-800" : ""}`}
            >
              <BarChart className="w-5 h-5" />
            </Button>
          </Link>

          {isLoading ? (
            // Show a loading placeholder for the auth button
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || ""}
                      alt={user.user_metadata?.full_name || "User"}
                    />
                    <AvatarFallback>{user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.user_metadata?.full_name && <p className="font-medium">{user.user_metadata.full_name}</p>}
                    {user.email && <p className="w-[200px] truncate text-sm text-gray-500">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm" variant="default" className="bg-purple-500 hover:bg-purple-600">
                Sign in
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
