import {
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, LoginService } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import EmailSent from "../components/Common/EmailSent"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import useCustomToast from "../hooks/useCustomToast"
import { emailPattern } from "../utils"

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
  const [userEmail, setUserEmail] = useState("")
  const { emailSent, setEmailSent } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const showToast = useCustomToast()

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
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    mutation.mutate(data)
    setUserEmail(data.email)
  }

  return (
    <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
      <BackgroundPanel />
      {emailSent ? (
        <EmailSent email={userEmail} />
      ) : (
        <Container
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          h="100vh"
          maxW="sm"
          alignItems="stretch"
          justifyContent="center"
          gap={4}
          centerContent
          data-testid="recover-password"
        >
          <Heading size="lg" textAlign="center" mb={2}>
            Password Recovery
          </Heading>
          <Text align="center">
            A password recovery email will be sent to the registered account.
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
            />
            {errors.email && (
              <FormErrorMessage>{errors.email.message}</FormErrorMessage>
            )}
          </FormControl>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Continue
          </Button>
        </Container>
      )}
    </Flex>
  )
}
