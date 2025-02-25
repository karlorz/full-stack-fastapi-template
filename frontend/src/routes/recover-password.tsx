import { Heading, Input, Link, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import { Email } from "@/assets/icons"
import CustomAuthContainer from "@/components/Auth/CustomContainer"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { Tooltip } from "@/components/ui/tooltip"
import { LoginService } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import EmailSent from "../components/Common/EmailSent"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import useCustomToast from "../hooks/useCustomToast"
import { emailPattern, handleError } from "../utils"

interface FormData {
  email: string
}

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
  const [showTooltip, setShowTooltip] = useState(false)
  let timeoutId: NodeJS.Timeout
  const [userEmail, setUserEmail] = useState("")
  const { emailSent, setEmailSent } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const { showErrorToast } = useCustomToast()

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => {
      setShowTooltip(true)
    }, 5000)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutId)
    setShowTooltip(false)
  }

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      email: data.email,
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      setEmailSent(true)
      reset()
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    mutation.mutate(data)
    setUserEmail(data.email)
  }

  return (
    <BackgroundPanel>
      {emailSent ? (
        <EmailSent email={userEmail} />
      ) : (
        <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
          <Heading>Password Recovery</Heading>
          <Text>
            Don't worry! We'll help you recover your account, no need to create
            a new one... yet.
          </Text>
          <Text>
            Just enter your email address below and we'll send you a link to
            reset your password.
          </Text>
          <Field invalid={!!errors.email} errorText={errors.email?.message}>
            <InputGroup w="100%" startElement={<Email />}>
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
          </Field>
          <Button
            variant="solid"
            type="submit"
            loading={isSubmitting}
            size="md"
          >
            Continue
          </Button>
          <RouterLink className="main-link" to="/login">
            Back to Login
          </RouterLink>
          <Text mt={4}>
            Cannot recover your account? {""}
            <Tooltip
              content="Just checking... are you sure you need help? 🧐"
              open={showTooltip}
            >
              <Link
                color="main.dark"
                fontWeight="bold"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Contact Support
              </Link>
            </Tooltip>
          </Text>
        </CustomAuthContainer>
      )}
    </BackgroundPanel>
  )
}

export default RecoverPassword
