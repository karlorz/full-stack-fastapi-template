import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { formatDate } from "date-fns"
import { useState } from "react"
import { z } from "zod"

import { LoginService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthCard from "@/components/ui/auth-card"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const deviceSearchSchema = z.object({
  code: z.string(),
})

const getDeviceQueryOptions = (code: string) =>
  queryOptions({
    queryKey: ["device", code],
    queryFn: () =>
      LoginService.deviceAuthorizationInfo({
        userCode: code,
      }),
  })

export const Route = createFileRoute("/device")({
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
  loader: async ({ context, deps: { code } }) => {
    await context.queryClient.ensureQueryData(getDeviceQueryOptions(code))
  },
})

function CodeNotFound() {
  return (
    <BackgroundPanel>
      <AuthCard
        title="Invalid Code"
        description="The code you provided is invalid or has expired."
      >
        <div className="space-y-6">
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
            The code you provided is invalid or has expired.
          </p>
          <Button
            asChild
            className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors mt-6"
          >
            <RouterLink to="/">Go to Dashboard</RouterLink>
          </Button>
        </div>
      </AuthCard>
    </BackgroundPanel>
  )
}

function AuthorizeDevice() {
  const { code } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const { showErrorToast } = useCustomToast()
  const { data: deviceAuthInfo } = useSuspenseQuery(getDeviceQueryOptions(code))

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
    <BackgroundPanel>
      <AuthCard
        title={success ? "Device Authorized" : "Authorize FastAPI CLI"}
        description={
          success
            ? "FastAPI CLI has been authorized successfully."
            : "Click the button below to authorize FastAPI CLI."
        }
      >
        {!success ? (
          <>
            <Alert className="mb-4">
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
            <LoadingButton
              type="submit"
              className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors mt-6"
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Authorize
            </LoadingButton>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md mt-4">
                Error: {error}
              </p>
            )}
          </>
        ) : null}
        {(success || error) && (
          <Button
            asChild
            className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors mt-6"
          >
            <RouterLink to="/">Go to Dashboard</RouterLink>
          </Button>
        )}
      </AuthCard>
    </BackgroundPanel>
  )
}
