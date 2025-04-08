"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function ApiKeyNotice() {
  const [apiKey, setApiKey] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setStatus("error")
      setMessage("Please enter an API key")
      return
    }

    try {
      // In a real app, you would save this to a secure storage
      // For now, we'll just show a success message
      setStatus("success")
      setMessage("API key saved! (Note: In this demo, the key is not actually stored)")

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowForm(false)
        setApiKey("")
        setStatus("idle")
        setMessage("")
      }, 3000)
    } catch (error) {
      setStatus("error")
      setMessage("Failed to save API key")
    }
  }

  if (!showForm) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
          <div>
            <h3 className="font-medium text-yellow-800">OpenAI API Key Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
              To use AI-powered reflections, you need to set up your OpenAI API key.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              onClick={() => setShowForm(true)}
            >
              Set up API Key
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-medium">Set OpenAI API Key</h3>
      <p className="text-sm text-gray-600 mt-1">Enter your OpenAI API key to enable AI-powered reflections.</p>

      <div className="mt-3 flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="flex-1"
        />
        <Button onClick={handleSaveKey}>Save</Button>
      </div>

      {status === "success" && (
        <div className="mt-2 flex items-center text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          {message}
        </div>
      )}

      {status === "error" && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {message}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>In a production app, you would:</p>
        <ol className="list-decimal ml-4 mt-1 space-y-1">
          <li>Add your API key to .env.local file</li>
          <li>Or set it in your Vercel project environment variables</li>
        </ol>
      </div>
    </div>
  )
}

