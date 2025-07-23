import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoginService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import AuthCard from "@/components/ui/auth-card"
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
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z
  .object({
    new_password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().nonempty("Password confirmation is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function ResetPassword() {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const navigate = useNavigate()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: { new_password: string; token: string }) =>
      LoginService.resetPassword({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Password updated successfully")
      form.reset()
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (values: FormData) => {
    if (mutation.isPending) return

    const token = new URLSearchParams(window.location.search).get("token")

    if (!token) {
      showErrorToast("Invalid or missing reset token")
      return
    }

    mutation.mutate({ new_password: values.new_password, token })
  }

  return (
    <BackgroundPanel>
      <AuthCard
        title="Reset Password"
        description="Please enter your new password and confirm it to reset your
              password"
        footer={
          <p className="pb-6 text-center text-sm font-body text-zinc-500 dark:text-zinc-400">
            Remembered your password?{" "}
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
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                    New Password
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
            <LoadingButton
              type="submit"
              className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80"
              loading={mutation.isPending}
            >
              Reset Password
            </LoadingButton>
          </form>
        </Form>
      </AuthCard>
    </BackgroundPanel>
  )
}
