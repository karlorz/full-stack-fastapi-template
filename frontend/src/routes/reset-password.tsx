import { Button, Heading, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { Lock } from "@/assets/icons"
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
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: NewPassword) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) return
    await LoginService.resetPassword({
      requestBody: { new_password: data.new_password, token: token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showToast("Success!", "Password updated successfully", "success")
      reset()
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showToast),
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <BackgroundPanel>
      <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
        <Heading>Reset Password</Heading>
        <Text>
          Please enter your new password and confirm it to reset your password.
        </Text>
        <PasswordInput
          startElement={<Lock color="fg.subtle" />}
          type="new_password"
          errors={errors}
          {...register("new_password", passwordRules())}
          placeholder="New Password"
        />
        <PasswordInput
          startElement={<Lock color="fg.subtle" />}
          type="confirm_password"
          errors={errors}
          {...register("confirm_password", confirmPasswordRules(getValues))}
          placeholder="Confirm Password"
        />
        <Button variant="solid" type="submit" size="md">
          Reset Password
        </Button>
      </CustomAuthContainer>
    </BackgroundPanel>
  )
}
