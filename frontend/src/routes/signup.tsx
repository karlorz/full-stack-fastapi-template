import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Text,
} from "@chakra-ui/react"
import { Link as RouterLink, createFileRoute, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaEnvelope, FaKey, FaUser } from "react-icons/fa"

import type { UserRegister } from "../client"
import AuthOptions from "../components/Auth/AuthOptions"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import EmailSent from "../components/Common/EmailSent"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import {
  confirmPasswordRules,
  emailPattern,
  namePattern,
  passwordRules,
} from "../utils"

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  }
})

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  const [userEmail, setUserEmail] = useState("")
  const { emailSent, signUpMutation } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    signUpMutation.mutate(data)
    setUserEmail(data.email)
  }

  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
        <BackgroundPanel />
        {emailSent ? (
          <EmailSent email={userEmail} />
        ) : (
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
              <Heading size="md">Sign Up</Heading>
              <Text fontSize="" color="gray.500">
                Create your account
              </Text>
            </Box>
            <FormControl id="full_name" isInvalid={!!errors.full_name}>
              <FormLabel htmlFor="full_name" srOnly>
                Full Name
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaUser} color="ui.dim" />
                </InputLeftElement>
                <Input
                  id="full_name"
                  {...register("full_name", {
                    required: "Full Name is required",
                    pattern: namePattern,
                  })}
                  placeholder="Full Name"
                  type="text"
                />
              </InputGroup>
              {errors.full_name && (
                <FormErrorMessage>{errors.full_name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl id="email" isInvalid={!!errors.email}>
              <FormLabel htmlFor="username" srOnly>
                Email
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaEnvelope} color="ui.dim" />
                </InputLeftElement>
                <Input
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: emailPattern,
                  })}
                  placeholder="Email"
                  type="email"
                />
              </InputGroup>
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl id="password" isInvalid={!!errors.password}>
              <FormLabel htmlFor="password" srOnly>
                Password
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaKey} color="ui.dim" />
                </InputLeftElement>
                <Input
                  id="password"
                  {...register("password", passwordRules())}
                  placeholder="Password"
                  type="password"
                />
              </InputGroup>
              {errors.password && (
                <FormErrorMessage>{errors.password.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              id="confirm_password"
              isInvalid={!!errors.confirm_password}
            >
              <FormLabel htmlFor="confirm_password" srOnly>
                Confirm Password
              </FormLabel>

              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaKey} color="ui.dim" />
                </InputLeftElement>
                <Input
                  id="confirm_password"
                  {...register(
                    "confirm_password",
                    confirmPasswordRules(getValues),
                  )}
                  placeholder="Repeat Password"
                  type="password"
                />
              </InputGroup>
              {errors.confirm_password && (
                <FormErrorMessage>
                  {errors.confirm_password.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <Text>
              {"By signing up, you agree to our "}
              <Link as={RouterLink} to="/" color="ui.main">
                Terms
              </Link>
              {" and "}
              <Link as={RouterLink} to="/" color="ui.main">
                Privacy Policy.
              </Link>
            </Text>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Sign Up
            </Button>
            <AuthOptions
              description={"Already have an account?"}
              path={"/login"}
            />
          </Container>
        )}
      </Flex>
    </>
  )
}

export default SignUp
