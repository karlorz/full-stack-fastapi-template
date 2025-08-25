import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
  useSearch,
} from "@tanstack/react-router"
import { Lock, Mail, User } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { UsersService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
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
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z
  .object({
    full_name: z.string().nonempty("Name is required"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().nonempty("Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

const searchSchema = z.object({
  email: z.string().optional(),
})

export const Route = createFileRoute("/signup")({
  component: SignUp,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function SignUp() {
  const search = useSearch({ from: "/signup" })
  const [userEmail, setUserEmail] = useState("")
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { signUpMutation } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: search.email || "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = (values: FormData) => {
    if (signUpMutation.isPending) return

    // biome-ignore lint/correctness/noUnusedVariables: we are removing the confirm_password from the values
    const { confirm_password, ...data } = values

    signUpMutation.mutate(data, {
      onSuccess: () => {
        setUserEmail(values.email)
      },
    })
  }

  const resendVerificationEmailMutation = useMutation({
    mutationFn: (email: string) =>
      UsersService.resendVerificationEmail({ requestBody: { email } }),
    onSuccess: () => {
      showSuccessToast("Verification email resent successfully")
    },
    onError: handleError.bind(showErrorToast),
  })

  const renderContent = () => {
    if (signUpMutation.isSuccess) {
      return (
        <AuthCard title="One More Step!">
          <div
            className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300"
            data-testid="email-sent"
          >
            <p>
              We've sent you an email at{" "}
              <span className="font-bold">{userEmail}</span>.
            </p>
            <p>
              Please <span className="font-bold">check your email</span> and
              follow the instructions to verify your account.
            </p>
            <div className="space-y-2 text-left">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Didn't receive the email?{" "}
                <LoadingButton
                  variant="link"
                  className="p-0 h-auto font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() =>
                    resendVerificationEmailMutation.mutate(userEmail)
                  }
                  loading={resendVerificationEmailMutation.isPending}
                >
                  Resend verification email.
                </LoadingButton>
              </p>
            </div>
            <Button
              className="w-full h-11 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Sign Up Another Account
            </Button>
          </div>
        </AuthCard>
      )
    }

    return (
      <AuthCard
        title="Sign Up"
        description="Create your account"
        footer={
          <p className="pb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <RouterLink
              to="/login"
              className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
            >
              Log In
            </RouterLink>
          </p>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
                      <Input
                        data-testid="full-name-input"
                        placeholder="Neo"
                        className="pl-10 h-11 rounded-md border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-all focus:border-primary/30 dark:focus:border-primary/50 focus:ring-1 focus:ring-primary/30 dark:focus:ring-primary/50"
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
              name="email"
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
                        type="email"
                        className="pl-10 h-11 rounded-md border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-all focus:border-primary/30 dark:focus:border-primary/50 focus:ring-1 focus:ring-primary/30 dark:focus:ring-primary/50"
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

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
                      <Input
                        data-testid="confirm-password-input"
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

            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body">
              By signing up, you agree to our{" "}
              <a
                href="https://fastapicloud.com/legal/terms"
                target="_blank"
                className="text-primary hover:underline hover:text-primary/80 transition-colors"
                rel="noreferrer"
              >
                Terms of Use
              </a>{" "}
              and{" "}
              <a
                href="https://fastapicloud.com/legal/privacy-policy"
                target="_blank"
                className="text-primary hover:underline hover:text-primary/80 transition-colors"
                rel="noreferrer"
              >
                Privacy Policy
              </a>
            </p>

            <LoadingButton
              type="submit"
              className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80 transition-colors"
              loading={signUpMutation.isPending}
            >
              Sign Up
            </LoadingButton>
          </form>
        </Form>
      </AuthCard>
    )
  }

  return <BackgroundPanel>{renderContent()}</BackgroundPanel>
}
