import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { formatDate } from "date-fns"
import { useState } from "react"
import { z } from "zod"

import { LoginService } from "@/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const deviceSearchSchema = z.object({
  code: z.string(),
})

export const Route = createFileRoute("/_layout/device")({
  component: AuthorizeDevice,
  errorComponent: CodeNotFound,
  validateSearch: (search) => deviceSearchSchema.parse(search),
  beforeLoad: async ({ location }) => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
  },
  loaderDeps: ({ search }) => ({
    code: search.code,
  }),
  loader: async ({ deps }) => {
    return await LoginService.deviceAuthorizationInfo({
      userCode: deps.code,
    })
  },
})

function CodeNotFound() {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Invalid code
      </h2>
      <p className="text-muted-foreground">
        The code you provided is invalid or has expired.
      </p>
    </div>
  )
}

function AuthorizeDevice() {
  const deviceAuthInfo = Route.useLoaderData()
  const { code } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        await LoginService.authorizeDevice({
          requestBody: { user_code: code },
        })
        setSuccess(true)
      } catch (err) {
        setError((err as any).body.detail)
      }
    },
    onError: handleError.bind(showErrorToast),
  })

  return (
    <div className="flex flex-col md:flex-row justify-center flex-1">
      {!success ? (
        <div className="max-w-xs md:max-w-md flex flex-col gap-4 justify-center">
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center md:text-left">
            Authorize FastAPI CLI
          </h2>
          <p className="text-muted-foreground">
            Click the button below to authorize FastAPI CLI
          </p>
          <Alert>
            <AlertDescription>
              This authorization was requested from{" "}
              <span className="font-bold" data-testid="request-ip">
                {deviceAuthInfo.request_ip}
              </span>{" "}
              on{" "}
              {formatDate(
                deviceAuthInfo.created_at,
                "MMMM dd, yyyy 'at' HH:mm (OOOO)",
              )}
            </AlertDescription>
          </Alert>
          <Button
            variant="default"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Authorizing..." : "Authorize"}
          </Button>

          {error && <p className="text-destructive">{error}</p>}
        </div>
      ) : (
        <Card className="max-w-xs md:max-w-md">
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center md:text-left">
              Device authorized
            </h2>
            <p className="text-muted-foreground">
              FastAPI CLI has been authorized successfully
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
