import { createFileRoute } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import { LoadingButton } from "@/components/ui/loading-button"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/callback")({
  component: Callback,
})

function Callback() {
  const { handleOAuthCallback } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const isPending = useRef(false)

  useEffect(() => {
    if (isPending.current) return

    isPending.current = true

    handleOAuthCallback().catch((e) => setError(e.message))
  }, [handleOAuthCallback])

  return (
    <BackgroundPanel>
      {error ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p>{error}</p>
        </div>
      ) : (
        <LoadingButton>
          <Loader2 className="h-4 w-4 animate-spin" />
        </LoadingButton>
      )}
    </BackgroundPanel>
  )
}
