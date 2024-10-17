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
  Tooltip,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import { Email, Lock, User } from "@/assets/icons.tsx"
import CustomAuthContainer from "@/components/Auth/CustomContainer"
import PasswordField from "@/components/Common/PasswordField"
import type { UserRegister } from "../client"
import AuthOptions from "../components/Auth/AuthOptions"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import EmailSent from "../components/Common/EmailSent"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import {
  confirmPasswordRules,
  emailPattern,
  nameRules,
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
  },
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
      <BackgroundPanel>
        {emailSent ? (
          <EmailSent email={userEmail} />
        ) : (
          <>
            <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
              <LightMode>
                <Box>
                  <Heading size="md">Sign Up</Heading>
                  <Text>Create your account</Text>
                </Box>
                <FormControl id="full_name" isInvalid={!!errors.full_name}>
                  <FormLabel htmlFor="full_name" srOnly>
                    Full Name
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={User} color="icon.base" />
                    </InputLeftElement>
                    <Input
                      id="full_name"
                      minLength={3}
                      {...register("full_name", nameRules())}
                      placeholder="Full Name"
                      type="text"
                      variant="outline"
                    />
                  </InputGroup>
                  {errors.full_name && (
                    <FormErrorMessage>
                      {errors.full_name.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl id="email" isInvalid={!!errors.email}>
                  <FormLabel htmlFor="username" srOnly>
                    Email
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={Email} color="icon.base" />
                    </InputLeftElement>
                    <Input
                      id="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: emailPattern,
                      })}
                      placeholder="Email"
                      required
                      type="email"
                      variant="outline"
                    />
                  </InputGroup>
                  {errors.email && (
                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
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
                <PasswordField
                  password="confirm_password"
                  errors={errors}
                  register={register}
                  options={confirmPasswordRules(getValues)}
                  placeholder="Repeat Password"
                  icon={Lock}
                />
                <Tooltip label="By agreeing, you're entering the Matrix (legally).">
                  <Text>
                    {"By signing up, you agree to our "}
                    <Link
                      as={RouterLink}
                      to="/"
                      color="main.dark"
                      fontWeight="bolder"
                    >
                      Terms
                    </Link>
                    {" and "}
                    <Link
                      as={RouterLink}
                      to="/"
                      color="main.dark"
                      fontWeight="bolder"
                    >
                      Privacy Policy.
                    </Link>
                  </Text>
                </Tooltip>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  size="md"
                >
                  Sign Up
                </Button>
                <AuthOptions
                  description={"Already have an account?"}
                  path={"/login"}
                />
              </LightMode>
            </CustomAuthContainer>
          </>
        )}
      </BackgroundPanel>
    </>
  )
}

export default SignUp
