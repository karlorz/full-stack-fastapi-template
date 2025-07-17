import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import AuthCard from "@/components/ui/auth-card"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/callback")({
  component: Callback,
})

function Callback() {
  const router = useRouter()
  const { handleOAuthCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const isPending = useRef(false)
  const handleHomeClick = () => router.history.push("/")

  useEffect(() => {
    if (isPending.current) return
    isPending.current = true
    handleOAuthCallback().catch((e) => setError(e.message))
  }, [handleOAuthCallback])

  const renderContent = () => {
    if (!error) {
      return (
        <AuthCard
          title="Authenticating..."
          description="Please wait while we log you in with your provider"
          showLogo
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-4" />
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
              Logging you in, please wait...
            </p>
          </div>
        </AuthCard>
      )
    }

    return (
      <AuthCard
        title="Authentication Failed"
        description="There was a problem logging you in with your provider"
        showLogo
      >
        <div className="space-y-6">
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
            Error: {error}
          </p>
          <Button
            className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors mt-6"
            onClick={handleHomeClick}
          >
            Back to Home
          </Button>
        </div>
      </AuthCard>
    )
  }

  return <BackgroundPanel>{renderContent()}</BackgroundPanel>
}
