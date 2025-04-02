import { Box, Heading, Input, Text } from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { Lock, Mail, User } from "lucide-react"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import CustomAuthContainer from "@/components/Auth/CustomContainer"
import EmailSent from "@/components/Common/EmailSent"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import { Tooltip } from "@/components/ui/tooltip"
import {
  confirmPasswordRules,
  emailPattern,
  nameRules,
  passwordRules,
} from "@/utils"
import type { UserRegister } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import useAuth, { isLoggedIn } from "../hooks/useAuth"

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
  const { signUpMutation } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
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
    <BackgroundPanel>
      <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
        {signUpMutation.isSuccess ? (
          <EmailSent email={userEmail} />
        ) : (
          <>
            <Box>
              <Heading>Sign Up</Heading>
              <Text>Create your account</Text>
            </Box>
            <Field
              invalid={!!errors.full_name}
              errorText={errors.full_name?.message}
            >
              <InputGroup w="100%" startElement={<User size={16} />}>
                <Input
                  id="full_name"
                  minLength={3}
                  {...register("full_name", nameRules())}
                  placeholder="Full Name"
                  type="text"
                />
              </InputGroup>
            </Field>
            <Field invalid={!!errors.email} errorText={errors.email?.message}>
              <InputGroup w="100%" startElement={<Mail size={16} />}>
                <Input
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: emailPattern,
                  })}
                  placeholder="Email"
                  required
                  type="email"
                />
              </InputGroup>
            </Field>
            <PasswordInput
              type="password"
              startElement={<Lock size={16} />}
              {...register("password", passwordRules())}
              placeholder="Password"
              errors={errors}
            />
            <PasswordInput
              type="confirm_password"
              startElement={<Lock size={16} />}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder="Confirm Password"
              errors={errors}
            />
            <Tooltip content="By agreeing, you're entering the Matrix (legally).">
              <Text>
                {"By signing up, you agree to our "}
                <RouterLink className="main-link" to="/">
                  Terms
                </RouterLink>
                {" and "}
                <RouterLink className="main-link" to="/">
                  Privacy Policy.
                </RouterLink>
              </Text>
            </Tooltip>
            <Button
              variant="solid"
              type="submit"
              loading={signUpMutation.isPending}
              size="md"
            >
              Sign Up
            </Button>
          </>
        )}
      </CustomAuthContainer>
    </BackgroundPanel>
  )
}

export default SignUp
