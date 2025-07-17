import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

import { UsersService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import AuthCard from "@/components/ui/auth-card"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
})

function VerifyEmail() {
  const router = useRouter()
  const handleHomeClick = () => router.history.push("/")
  const token = new URLSearchParams(window.location.search).get("token")

  const verifyEmail = async (token: string) => {
    await UsersService.verifyEmailToken({ requestBody: { token: token } })
  }

  const mutation = useMutation({
    mutationFn: verifyEmail,
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: Including the mutation in the dependencies would cause an infinite loop
  useEffect(() => {
    // using a timeout here to prevent the mutation from firing multiple
    // times on StrictMode in dev
    const timeout = setTimeout(() => {
      if (token) {
        mutation.mutate(token)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [token])

  const loading = mutation.isPending || mutation.isIdle

  const renderContent = () => {
    if (loading) {
      return (
        <AuthCard
          title="Verifying Email"
          description="Please wait while we verify your email address"
          showLogo
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
              Verifying your email, please wait..
            </p>
          </div>
        </AuthCard>
      )
    }

    if (mutation.isSuccess) {
      return (
        <AuthCard
          title="Successful Email Verification"
          description="Your email has been successfully verified"
        >
          <div className="space-y-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Thank you for verifying your email address. You can now access all
              features of your account.
            </p>
            <Button
              className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors mt-6"
              onClick={handleHomeClick}
            >
              Continue to Login
            </Button>
          </div>
        </AuthCard>
      )
    }

    if (mutation.isError) {
      return (
        <AuthCard
          title="Email Verification Failed"
          description="There was a problem verifying your email"
        >
          <div className="space-y-6">
            {mutation.error && (
              <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
                Error:{" "}
                {(mutation.error as any).body?.detail ||
                  "Unknown error occurred"}
              </p>
            )}
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

    return null
  }

  return <BackgroundPanel>{renderContent()}</BackgroundPanel>
}
