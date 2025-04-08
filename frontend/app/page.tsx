"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "./components/page-header"
import { Logo } from "./components/logo"
import { useEffect, useState } from "react"

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="max-w-md mx-auto pt-12 flex flex-col items-center">
        {mounted && (
          <div className="animate-bounce-slow">
            <Logo className="w-32 h-32 mb-8" animated={true} variant="standard" />
          </div>
        )}

        <PageHeader
          title="Welcome to Feel-Write"
          subtitle="Your daily emotional check-in companion"
        />

        <div className="text-center space-y-4 mb-12">
          <p className="text-2xl font-medium text-purple-800">
            How are you feeling?
          </p>
          <p className="text-lg text-gray-600">
            Select the emotion that best describes your current state
          </p>
        </div>

        <div className="w-full space-y-4">
          <Link href="/emotions" className="block w-full">
            <Button
              className="w-full py-6 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Start Check-in
            </Button>
          </Link>

          <Link href="/dashboard" className="block w-full">
            <Button
              variant="outline"
              className="w-full py-6 rounded-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              View Your Journal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
