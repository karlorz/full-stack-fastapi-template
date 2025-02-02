import { Box, Heading, Input, Text } from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { Email, Lock } from "@/assets/icons"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { emailPattern, passwordRules } from "@/utils"
import type { Body_login_login_access_token as AccessToken } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import CustomAuthContainer from "../components/Auth/CustomContainer"
import TeamInvitation from "../components/Invitations/TeamInvitation"
import { PasswordInput } from "../components/ui/password-input"
import useAuth, { isLoggedIn } from "../hooks/useAuth"

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    try {
      await loginMutation.mutateAsync({ redirect: redirectUrl, formData: data })
    } catch {
      // error is handled by useAuth hook
    }
  }

  return (
    <>
      <BackgroundPanel>
        <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Heading>Welcome!</Heading>
            <Text>Sign in to your account</Text>
          </Box>
          <Field
            invalid={!!errors.username}
            errorText={errors.username?.message}
          >
            <InputGroup w="100%" startElement={<Email />}>
              <Input
                id="username"
                {...register("username", {
                  pattern: emailPattern,
                })}
                placeholder="Email"
                type="email"
                required
                variant="outline"
              />
            </InputGroup>
          </Field>
          <PasswordInput
            type="password"
            startElement={<Lock />}
            {...register("password", passwordRules())}
            placeholder="Password"
            errors={errors}
          />
          <RouterLink className="main-link" to="/recover-password">
            Forgot Password?
          </RouterLink>
          <Button
            variant="solid"
            type="submit"
            loading={isSubmitting}
            size="md"
          >
            Log In
          </Button>
          {/* <AuthOptions
            description={"Don't have an account?"}
            path={"/signup"}
          /> */}
        </CustomAuthContainer>
      </BackgroundPanel>
      <TeamInvitation />
    </>
  )
}
