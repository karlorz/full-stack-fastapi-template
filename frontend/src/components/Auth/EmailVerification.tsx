import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

import { UsersService } from "@/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "../ui/button"

const EmailVerification = () => {
  const router = useRouter()
  const handleOkClick = () => router.history.push("/")
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

  return (
    <>
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>Verifying Email</CardTitle>
          </CardHeader>
          <CardContent>Verifying your email, please wait...</CardContent>
        </Card>
      )}

      {mutation.isSuccess && (
        <Card data-testid="result">
          <CardHeader>
            <CardTitle>Successful Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            Your email has been verified. You can now login to your account.
            <Button
              variant="default"
              className="w-full mt-4"
              onClick={handleOkClick}
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      )}

      {mutation.isError && (
        <Card data-testid="error">
          <CardHeader>
            <CardTitle>Email Verification Failed</CardTitle>
          </CardHeader>
          <CardContent>
            There was an error verifying your email. Please try again.
            <p className="text-sm text-destructive">
              Error detail: {(mutation.error as any).body?.detail}
            </p>
            <Button
              variant="default"
              className="w-full mt-4"
              onClick={handleOkClick}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default EmailVerification
