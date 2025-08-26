import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { Lock, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FaGithub } from "react-icons/fa"
import { z } from "zod"
import type { Body_login_login_access_token as AccessToken } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import TeamInvitation from "@/components/Invitations/TeamInvitation"
import AuthCard from "@/components/ui/auth-card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const formSchema = z.object({
  username: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters"),
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Login - FastAPI Cloud",
      },
    ],
  }),
})

function Login() {
  const searchParams = new URLSearchParams(window.location.search)
  const redirectRaw = searchParams.get("redirect")
  const redirectDecoded = redirectRaw ? decodeURIComponent(redirectRaw) : "/"
  const redirectUrl = redirectDecoded.startsWith("/") ? redirectDecoded : "/"
  const { loginMutation, loginWithProvider } = useAuth()
  const [pendingDeviceAuth, setPendingDeviceAuth] = useState<{
    code: string
    timestamp: number
  } | null>(null)

  useEffect(() => {
    const pending = sessionStorage.getItem("pending_device_auth")
    if (pending) {
      try {
        const authData = JSON.parse(pending)
        // Only restore if less than 10 minutes old
        if (Date.now() - authData.timestamp < 10 * 60 * 1000) {
          setPendingDeviceAuth(authData)
        } else {
          sessionStorage.removeItem("pending_device_auth")
        }
      } catch {
        sessionStorage.removeItem("pending_device_auth")
      }
    }
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (values: AccessToken) => {
    if (loginMutation.isPending) return

    try {
      const finalRedirectUrl = pendingDeviceAuth
        ? `/device?code=${pendingDeviceAuth.code}`
        : redirectUrl

      await loginMutation.mutateAsync({
        redirect: finalRedirectUrl,
        formData: values,
      })

      if (pendingDeviceAuth) {
        sessionStorage.removeItem("pending_device_auth")
      }
    } catch {
      // error is handled by useAuth hook
    }
  }

  return (
    <BackgroundPanel>
      <AuthCard
        title="Welcome!"
        description="Sign in to your account"
        footer={
          <p className="pb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <RouterLink
              to="/signup"
              className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
            >
              Sign Up
            </RouterLink>
          </p>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
                      <Input
                        data-testid="email-input"
                        placeholder="neo@matrix.io"
                        className="pl-10 h-11 rounded-md border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-all focus:border-primary/30 dark:focus:border-primary/50 focus:ring-1 focus:ring-primary/30 dark:focus:ring-primary/50"
                        type="email"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
                      <Input
                        data-testid="password-input"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 rounded-md border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-all focus:border-primary/30 dark:focus:border-primary/50 focus:ring-1 focus:ring-primary/30 dark:focus:ring-primary/50"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="text-right">
              <RouterLink
                to="/recover-password"
                className="text-primary text-sm hover:underline hover:text-primary/80 transition-colors"
              >
                Forgot Password?
              </RouterLink>
            </div>

            <LoadingButton
              type="submit"
              className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80"
              loading={loginMutation.isPending}
            >
              Log In
            </LoadingButton>

            <div className="flex items-center w-full my-6">
              <Separator className="flex-1 bg-zinc-200 dark:bg-zinc-700" />
              <span className="px-4 text-sm text-zinc-500 dark:text-zinc-400">
                or
              </span>
              <Separator className="flex-1 bg-zinc-200 dark:bg-zinc-700" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-200"
              onClick={() => loginWithProvider("github")}
            >
              <FaGithub className="mr-2 h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              <span className="font-body">Log In with GitHub</span>
            </Button>
          </form>
        </Form>
      </AuthCard>
      <TeamInvitation />
    </BackgroundPanel>
  )
}
