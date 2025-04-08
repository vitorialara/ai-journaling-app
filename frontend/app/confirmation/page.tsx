"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "../components/page-header"
import { Logo } from "../components/logo"

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-md mx-auto pt-12 flex flex-col items-center">
        <Logo className="w-32 h-32 mb-4" animated={true} variant="standard" />

        <PageHeader
          title="Check-in Complete"
          subtitle="Thank you for taking time for yourself today"
          className="mt-6"
        />

        <p className="mt-6 text-center text-gray-600">
          Your journal entry has been saved. Taking time to acknowledge your emotions is an important step in your
          mental health journey.
        </p>

        <div className="mt-8 space-y-4 w-full">
          <Link href="/dashboard">
            <Button className="w-full py-6 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-all duration-300 shadow-md hover:shadow-lg">
              View Your Journal
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full py-6 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              New Check-in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

