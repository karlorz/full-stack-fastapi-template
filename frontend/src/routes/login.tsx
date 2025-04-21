import { zodResolver } from "@hookform/resolvers/zod"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import TeamInvitation from "@/components/Invitations/TeamInvitation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
})

function Login() {
  const searchParams = new URLSearchParams(window.location.search)
  const redirectRaw = searchParams.get("redirect")
  const redirectDecoded = redirectRaw ? decodeURIComponent(redirectRaw) : "/"
  const redirectUrl = redirectDecoded.startsWith("/") ? redirectDecoded : "/"
  const { loginMutation } = useAuth()
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
      await loginMutation.mutateAsync({
        redirect: redirectUrl,
        formData: values,
      })
    } catch {
      // error is handled by useAuth hook
    }
  }

  return (
    <>
      <BackgroundPanel>
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            data-testid="email-input"
                            placeholder="user@example.com"
                            className="pl-10"
                            type="email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            data-testid="password-input"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right">
                  <RouterLink
                    to="/recover-password"
                    className="text-primary text-sm hover:underline"
                  >
                    Forgot Password?
                  </RouterLink>
                </div>
                <LoadingButton
                  type="submit"
                  className="w-full"
                  loading={loginMutation.isPending}
                >
                  Log In
                </LoadingButton>
              </form>
            </Form>
          </CardContent>
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <RouterLink to="/signup" className="text-primary hover:underline">
              Sign up
            </RouterLink>
          </div>
        </Card>
      </BackgroundPanel>
      <TeamInvitation />
    </>
  )
}
