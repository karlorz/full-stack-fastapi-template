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
import { useEffect, useState } from "react"
import { z } from "zod"

import { LoginService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthCard from "@/components/ui/auth-card"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const deviceSearchSchema = z.object({
  code: z.string(),
})

type AuthState = "checking" | "expired" | "valid"

const savePendingDeviceAuth = (code: string) => {
  sessionStorage.setItem(
    "pending_device_auth",
    JSON.stringify({
      code,
      timestamp: Date.now(),
    }),
  )
}

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

function GoToDashboardButton() {
  return (
    <Button
      asChild
      className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors mt-6"
    >
      <RouterLink to="/">Go to Dashboard</RouterLink>
    </Button>
  )
}

function CodeNotFound() {
  return (
    <BackgroundPanel>
      <AuthCard
        title="Invalid Code"
        description="Unable to process device authorization request."
      >
        <div className="space-y-6">
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
            The code you provided is invalid or has expired.
          </p>
          <GoToDashboardButton />
        </div>
      </AuthCard>
    </BackgroundPanel>
  )
}

function AuthorizeDevice() {
  const { code } = Route.useSearch()
  const { data: deviceAuthInfo } = useSuspenseQuery(getDeviceQueryOptions(code))
  const { checkTokenValidity } = useAuth()
  const [authState, setAuthState] = useState<AuthState>("checking")

  const mutation = useMutation({
    mutationFn: async () => {
      await LoginService.authorizeDevice({ requestBody: { user_code: code } })
    },
    onError: (error: any) => {
      if (
        error?.body?.detail === "Invalid credentials" ||
        error?.status === 401
      ) {
        setAuthState("expired")
      }
    },
  })

  useEffect(() => {
    const checkAuth = async () => {
      const tokenValid = await checkTokenValidity()
      setAuthState(tokenValid ? "valid" : "expired")
    }
    checkAuth()
  }, [checkTokenValidity])

  const renderContent = () => {
    if (authState === "checking") {
      return (
        <AuthCard title="Checking Authentication">
          <div className="flex flex-col items-center justify-center space-y-6">
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
              Verifying your session status, please wait...
            </p>
          </div>
        </AuthCard>
      )
    }

    if (authState === "expired") {
      return (
        <AuthCard
          title="Session Expired"
          description="Your session has expired. Please log in again to authorize the device."
        >
          <div className="space-y-4">
            <Button
              className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors"
              onClick={() => {
                savePendingDeviceAuth(code)
                window.location.href = "/login"
              }}
            >
              Log In Again
            </Button>
          </div>
        </AuthCard>
      )
    }

    if (authState === "valid" && !mutation.isSuccess && !mutation.isError) {
      return (
        <AuthCard
          title="Authorize FastAPI CLI"
          description="Click the button below to authorize FastAPI CLI."
        >
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
        </AuthCard>
      )
    }

    if (mutation.isSuccess) {
      return (
        <AuthCard
          title="Device Authorized"
          description="FastAPI CLI has been authorized successfully."
        >
          <GoToDashboardButton />
        </AuthCard>
      )
    }

    if (mutation.isError) {
      return (
        <AuthCard
          title="Authorization Failed"
          description="There was a problem authorizing the device."
        >
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
            Error:{" "}
            {(mutation.error as any).body?.detail || "Unknown error occurred"}
          </p>
          <GoToDashboardButton />
        </AuthCard>
      )
    }

    return null
  }

  return <BackgroundPanel>{renderContent()}</BackgroundPanel>
}
