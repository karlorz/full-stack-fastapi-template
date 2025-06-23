import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { Lock, Mail, User } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { UsersService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import { Button } from "@/components/ui/button"
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

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function SignUp() {
  const [userEmail, setUserEmail] = useState("")
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { signUpMutation } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
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

  return (
    <BackgroundPanel>
      <Card>
        <CardHeader>
          <CardTitle>
            {signUpMutation.isSuccess ? "One More Step!" : "Sign Up"}
          </CardTitle>
          <CardDescription>
            {signUpMutation.isSuccess ? null : "Create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signUpMutation.isSuccess ? (
            <div
              className="space-y-6 text-sm text-muted-foreground"
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
                <div className="text-sm text-muted-foreground">
                  Didn't receive the email?{" "}
                  <LoadingButton
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() =>
                      resendVerificationEmailMutation.mutate(userEmail)
                    }
                  >
                    Resend verification email.
                  </LoadingButton>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Sign up another account
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            data-testid="full-name-input"
                            placeholder="John Doe"
                            className="pl-10"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            data-testid="email-input"
                            placeholder="user@example.com"
                            type="email"
                            className="pl-10"
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

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            data-testid="confirm-password-input"
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
                <div className="text-sm text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <a
                    href="https://fastapicloud.com/legal/terms"
                    target="_blank"
                    className="text-primary hover:underline"
                    rel="noreferrer"
                  >
                    Terms of Use{" "}
                  </a>
                  and{" "}
                  <a
                    href="https://fastapicloud.com/legal/privacy-policy"
                    target="_blank"
                    className="text-primary hover:underline"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </a>
                </div>
                <LoadingButton
                  type="submit"
                  className="w-full"
                  loading={signUpMutation.isPending}
                >
                  Sign Up
                </LoadingButton>
              </form>
            </Form>
          )}
        </CardContent>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <RouterLink to="/login" className="text-primary hover:underline">
            Log In
          </RouterLink>
        </div>
      </Card>
    </BackgroundPanel>
  )
}

export default SignUp
