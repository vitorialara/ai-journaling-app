"use client"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/app/components/page-header"
import { Logo } from "@/app/components/logo"
import Link from "next/link"

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-md mx-auto pt-12 flex flex-col items-center">
        <Logo className="w-24 h-24 mb-6" animated={true} variant="standard" />
        <PageHeader title="Check Your Email" subtitle="We've sent you a verification link" />

        <div className="mt-6 p-6 bg-white rounded-xl shadow-sm w-full">
          <p className="text-center text-gray-600">
            Please check your email inbox and click on the verification link to complete your registration.
          </p>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-700">
              <strong>Note:</strong> If you don't see the email, please check your spam folder.
            </p>
          </div>
        </div>

        <div className="mt-8 w-full">
          <Link href="/auth/signin">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

