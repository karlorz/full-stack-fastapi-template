import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  LightMode,
  Link,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

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
  const showToast = useCustomToast()

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
    onError: handleError.bind(showToast),
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
        <Container
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          maxW={{ base: "md", md: "lg" }}
          p={{ base: 4, md: 12 }}
          color="ui.defaultText"
          h="70%"
          alignItems="stretch"
          justifyContent="center"
          gap={4}
          centerContent
          borderRadius="md"
          data-testid="recover-password"
          bg="ui.lightBg"
          zIndex="4"
        >
          <LightMode>
            <Heading size="md">Password Recovery</Heading>
            <Text>
              Don't worry! We'll help you recover your account, no need to
              create a new one... yet.
            </Text>
            <Text>
              Just enter your email address below and we'll send you a link to
              reset your password.
            </Text>
            <FormControl isInvalid={!!errors.email}>
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: emailPattern,
                })}
                placeholder="Email"
                type="email"
                variant="outline"
              />
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              size="md"
            >
              Continue
            </Button>
            <Link
              as={RouterLink}
              color="ui.main"
              fontWeight="bolder"
              to="/login"
            >
              Back to Login
            </Link>
            <Text fontSize="sm" mt={4}>
              Cannot recover your account? {""}
              <Tooltip
                label="Just checking... are you sure you need help? 🧐"
                isOpen={showTooltip}
              >
                <Link
                  color="ui.main"
                  fontWeight="bolder"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Contact Support
                </Link>
              </Tooltip>
            </Text>
          </LightMode>
        </Container>
      )}
    </BackgroundPanel>
  )
}

export default RecoverPassword
