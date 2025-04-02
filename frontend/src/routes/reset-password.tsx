import { Button, Heading, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Lock } from "lucide-react"
import { type SubmitHandler, useForm } from "react-hook-form"

import CustomAuthContainer from "@/components/Auth/CustomContainer"
import { PasswordInput } from "@/components/ui/password-input"
import { LoginService, type NewPassword } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import { isLoggedIn } from "../hooks/useAuth"
import useCustomToast from "../hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "../utils"

interface NewPasswordForm extends NewPassword {
  confirm_password: string
}

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
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<NewPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
    },
  })
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: {
    newPassword: string
    token: string
  }) => {
    return LoginService.resetPassword({
      requestBody: { new_password: data.newPassword, token: data.token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showSuccessToast("Password updated successfully")
      reset()
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    const token = new URLSearchParams(window.location.search).get("token")

    if (token) {
      mutation.mutate({
        newPassword: data.new_password,
        token,
      })
    } else {
      showErrorToast("Invalid or missing reset token")
    }
  }

  return (
    <BackgroundPanel>
      <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
        <Heading>Reset Password</Heading>
        <Text>
          Please enter your new password and confirm it to reset your password.
        </Text>
        <PasswordInput
          startElement={<Lock size={16} />}
          type="new_password"
          errors={errors}
          {...register("new_password", passwordRules())}
          placeholder="New Password"
        />
        <PasswordInput
          startElement={<Lock size={16} />}
          type="confirm_password"
          errors={errors}
          {...register("confirm_password", confirmPasswordRules(getValues))}
          placeholder="Confirm Password"
        />
        <Button
          variant="solid"
          type="submit"
          size="md"
          loading={mutation.isPending}
        >
          Reset Password
        </Button>
      </CustomAuthContainer>
    </BackgroundPanel>
  )
}
