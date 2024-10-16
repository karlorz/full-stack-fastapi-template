import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  LightMode,
  Link,
  Text,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { Email, Lock } from "@/assets/icons.tsx"
import PasswordField from "@/components/Common/PasswordField"
import type { Body_login_login_access_token as AccessToken } from "../client"
import AuthOptions from "../components/Auth/AuthOptions"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import CustomAuthContainer from "../components/Auth/CustomContainer"
import TeamInvitation from "../components/Invitations/TeamInvitation"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import { emailPattern, passwordRules } from "../utils"

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
          <LightMode>
            <Box>
              <Heading size="md">Welcome!</Heading>
              <Text>Sign in to your account</Text>
            </Box>
            <FormControl id="username" isInvalid={!!errors.username}>
              <FormLabel htmlFor="username" srOnly>
                Email
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Email} color="ui.dim" />
                </InputLeftElement>
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
              {errors.username && (
                <FormErrorMessage>{errors.username.message}</FormErrorMessage>
              )}
            </FormControl>
            <PasswordField
              password="password"
              errors={errors}
              register={register}
              options={passwordRules()}
              placeholder="Password"
              icon={Lock}
            />
            <Link
              as={RouterLink}
              to="/recover-password"
              color="ui.main"
              fontWeight="bolder"
            >
              Forgot Password?
            </Link>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              size="md"
            >
              Log In
            </Button>
            <AuthOptions
              description={"Don't have an account?"}
              path={"/signup"}
            />
          </LightMode>
        </CustomAuthContainer>
      </BackgroundPanel>
      <TeamInvitation />
    </>
  )
}
