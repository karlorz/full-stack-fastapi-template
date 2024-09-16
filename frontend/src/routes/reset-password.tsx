import {
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
  Text,
  useBoolean,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import { FaKey } from "react-icons/fa"
import { LoginService, type NewPassword } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import { isLoggedIn } from "../hooks/useAuth"
import useCustomToast from "../hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "../utils"

interface NewPasswordForm extends NewPassword {
  confirm_password: string
}

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function ResetPassword() {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<NewPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
    },
  })
  const [show, setShow] = useBoolean()
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: NewPassword) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) return
    await LoginService.resetPassword({
      requestBody: { new_password: data.new_password, token: token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showToast("Success!", "Password updated successfully", "success")
      reset()
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showToast),
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <BackgroundPanel>
      <Container
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        maxW={{ base: "xs", md: "lg" }}
        p={{ base: 4, md: 12 }}
        color="ui.defaultText"
        h="70%"
        alignItems="stretch"
        justifyContent="center"
        centerContent
        borderRadius="md"
        boxShadow="md"
        bg="ui.lightBg"
        gap={4}
        zIndex="4"
      >
        <Heading size="md">Reset Password</Heading>
        <Text>
          Please enter your new password and confirm it to reset your password.
        </Text>
        <FormControl id="password" isInvalid={!!errors.new_password}>
          <FormLabel htmlFor="password" srOnly>
            Password
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaKey} color="ui.dim" />
            </InputLeftElement>
            <Input
              {...register("new_password", passwordRules())}
              type={show ? "text" : "password"}
              placeholder="New Password"
              required
              variant="outline"
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
          {errors.new_password && (
            <FormErrorMessage>{errors.new_password.message}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl id="password" isInvalid={!!errors.confirm_password}>
          <FormLabel htmlFor="password" srOnly>
            Password
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaKey} color="ui.dim" />
            </InputLeftElement>
            <Input
              id="confirm_password"
              {...register("confirm_password", confirmPasswordRules(getValues))}
              type={show ? "text" : "password"}
              placeholder="Confirm Password"
              required
              variant="outline"
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
          {errors.new_password && (
            <FormErrorMessage>{errors.new_password.message}</FormErrorMessage>
          )}
        </FormControl>
        <Button variant="primary" type="submit" size="md">
          Reset Password
        </Button>
      </Container>
    </BackgroundPanel>
  )
}
