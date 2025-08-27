import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { LoginService } from "@/client"
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
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  email: z.email(),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
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
        title: "Recover Password - FastAPI Cloud",
      },
    ],
  }),
})
function RecoverPassword() {
  const { showErrorToast } = useCustomToast()
  const [userEmail, setUserEmail] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (email: string) => LoginService.recoverPassword({ email }),
    onSuccess: (_, variables) => {
      setUserEmail(variables)
      form.reset()
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (values: FormData) => {
    if (mutation.isPending) return
    mutation.mutate(values.email)
  }

  const renderContent = () => {
    if (mutation.isSuccess) {
      return (
        <AuthCard title="One More Step!">
          <div
            className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300"
            data-testid="email-sent"
          >
            <p>
              We've sent you a password reset link to{" "}
              <span className="font-bold">{userEmail}</span>.
            </p>
            <p>
              Please <span className="font-bold">check your email</span> and
              follow the instructions to reset your password.
            </p>
            <Button
              className="w-full h-11 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
              variant="outline"
              onClick={() => {
                form.reset()
                mutation.reset()
              }}
            >
              Try Another Email
            </Button>
          </div>
        </AuthCard>
      )
    }

    return (
      <AuthCard
        title="Recover Password"
        description="Don't worry! We'll help you recover your account, no need to create
              a new one... yet."
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
                        placeholder="user@example.com"
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
            <div className="text-right">
              <a
                href="mailto:support@fastapicloud.com"
                className="text-primary text-sm hover:underline hover:text-primary/80 transition-colors"
              >
                Need Help?
              </a>
            </div>

            <LoadingButton
              type="submit"
              className="w-full h-11 mb-0 rounded-md bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 hover:bg-primary/80"
              loading={mutation.isPending}
            >
              Continue
            </LoadingButton>
          </form>
        </Form>
      </AuthCard>
    )
  }

  return <BackgroundPanel>{renderContent()}</BackgroundPanel>
}
