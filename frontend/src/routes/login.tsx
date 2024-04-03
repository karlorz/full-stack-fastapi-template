import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
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
  const [show, setShow] = useBoolean()
  const { loginMutation, error } = useAuth()
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
    loginMutation.mutate(data)
  }

  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
        <BackgroundPanel />
        <Container
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          maxW={{ base: "xs", md: "md" }}
          flexDir="column"
          alignItems="stretch"
          justifyContent="center"
          centerContent
          gap={4}
        >
          <Box>
            <Text fontWeight="bolder" fontSize="2xl">
              Welcome!
            </Text>
            <Text fontSize="md" color="gray.500">
              Sign in to your account
            </Text>
          </Box>
          <FormControl id="username" isInvalid={!!errors.username || !!error}>
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
              />
            </InputGroup>
            {errors.username && (
              <FormErrorMessage>{errors.username.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="password" isInvalid={!!error}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaKey} color="ui.dim" />
              </InputLeftElement>
              <Input
                {...register("password")}
                type={show ? "text" : "password"}
                placeholder="Password"
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
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Log In
          </Button>
          <AuthOptions
            description={"Don't have an account?"}
            path={"/signup"}
          />
        </Container>
      </Flex>
    </>
  )
}
