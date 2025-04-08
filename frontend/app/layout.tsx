import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NavBar } from "./components/nav-bar"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Feel-Write - Mental Health Check-in",
  description: "Track your emotions and mental well-being with daily check-ins",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar />
          <main className="pt-16 pb-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'
