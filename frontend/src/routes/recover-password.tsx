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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
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
})

function RecoverPassword() {
  const { showErrorToast } = useCustomToast()
  const [showTooltip, setShowTooltip] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  let timeoutId: NodeJS.Timeout

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

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => {
      setShowTooltip(true)
    }, 5000)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutId)
    setShowTooltip(false)
  }

  const onSubmit = (values: FormData) => {
    if (mutation.isPending) return

    mutation.mutate(values.email)
  }

  return (
    <BackgroundPanel>
      <Card>
        <CardHeader>
          <CardTitle>
            {mutation.isSuccess ? "One More Step!" : "Recover Password"}
          </CardTitle>
          <CardDescription>
            {mutation.isSuccess
              ? null
              : "Don't worry! We'll help you recover your account, no need to create a new one... yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mutation.isSuccess ? (
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
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  form.reset()
                  mutation.reset()
                }}
              >
                Try another email
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
                <LoadingButton
                  type="submit"
                  className="w-full"
                  loading={mutation.isPending}
                >
                  Continue
                </LoadingButton>
                <div className="text-center">
                  <RouterLink
                    to="/login"
                    className="text-sm text-primary hover:underline"
                  >
                    Back to Login
                  </RouterLink>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Cannot recover your account?{" "}
                  <TooltipProvider>
                    <Tooltip open={showTooltip}>
                      <TooltipTrigger
                        className="text-primary hover:underline"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        Contact Support
                      </TooltipTrigger>
                      <TooltipContent>
                        Just checking... are you sure you need help? 🧐
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </BackgroundPanel>
  )
}

export default RecoverPassword
