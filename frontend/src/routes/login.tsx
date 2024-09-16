import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Text,
  useBoolean,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaEnvelope, FaKey } from "react-icons/fa"

import type { Body_login_login_access_token as AccessToken } from "../client"
import AuthOptions from "../components/Auth/AuthOptions"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import TeamInvitation from "../components/Invitations/TeamInvitation"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import { emailPattern } from "../utils"

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
  const [show, setShow] = useBoolean()
  const { loginMutation, error, resetError } = useAuth()
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

    resetError()

    try {
      await loginMutation.mutateAsync({ redirect: redirectUrl, formData: data })
    } catch {
      // error is handled by useAuth hook
    }
  }

  return (
    <>
      <BackgroundPanel>
        <Container
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          maxW={{ base: "xs", md: "lg" }}
          p={{ base: 4, md: 12 }}
          color="ui.defaultText"
          h="70%"
          flexDir="column"
          alignItems="stretch"
          justifyContent="center"
          centerContent
          borderRadius="md"
          boxShadow="md"
          bg="ui.lightBg"
          gap={4}
          zIndex="4"
        >
          <Box>
            <Heading size="md">Welcome!</Heading>
            <Text>Sign in to your account</Text>
          </Box>
          <FormControl id="username" isInvalid={!!errors.username || !!error}>
            <FormLabel htmlFor="username" srOnly>
              Email
            </FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaEnvelope} color="ui.dim" />
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
          <FormControl id="password" isInvalid={!!error}>
            <FormLabel htmlFor="password" srOnly>
              Password
            </FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaKey} color="ui.dim" />
              </InputLeftElement>
              <Input
                {...register("password")}
                type={show ? "text" : "password"}
                placeholder="Password"
                required
              />
              <InputRightElement
                color="ui.dim"
                _hover={{
                  cursor: "pointer",
                }}
              >
                <Icon
                  onClick={setShow.toggle}
                  aria-label={show ? "Hide password" : "Show password"}
                  color="ui.dim"
                >
                  {show ? <ViewOffIcon /> : <ViewIcon />}
                </Icon>
              </InputRightElement>
            </InputGroup>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>
          <Link
            as={RouterLink}
            to="/recover-password"
            color="ui.main"
            fontWeight="bolder"
          >
            Forgot password?
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
        </Container>
      </BackgroundPanel>
      <TeamInvitation />
    </>
  )
}
