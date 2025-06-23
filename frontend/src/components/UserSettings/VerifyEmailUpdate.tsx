import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

import { UsersService } from "@/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const VerifyEmailUpdate = () => {
  const token = new URLSearchParams(window.location.search).get("token")

  const verifyEmail = async (token: string) => {
    await UsersService.verifyUpdateEmailToken({ requestBody: { token: token } })
  }

  const mutation = useMutation({
    mutationFn: verifyEmail,
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is ok
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

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        {loading && (
          <CardHeader>
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying your email, please wait...
            </CardDescription>
          </CardHeader>
        )}

        {mutation.isSuccess && (
          <>
            <CardHeader>
              <CardTitle>Success!</CardTitle>
            </CardHeader>
            <CardContent data-testid="result">
              <p className="mb-4">
                Your email address has been updated successfully.
              </p>
              <RouterLink
                to="/"
                className="text-primary hover:underline font-medium"
              >
                Go to Your Dashboard
              </RouterLink>
            </CardContent>
          </>
        )}

        {mutation.isError && (
          <>
            <CardHeader>
              <CardTitle>Email Verification Failed</CardTitle>
            </CardHeader>
            <CardContent data-testid="error">
              <p className="mb-4">
                There was an error verifying your email. Please try again.
              </p>
              <p className="text-destructive">
                Error detail: {(mutation.error as any).body?.detail}
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}

export default VerifyEmailUpdate
