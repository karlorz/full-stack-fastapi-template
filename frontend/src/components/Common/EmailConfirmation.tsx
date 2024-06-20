import { Box, Container, Link, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { useEffect } from "react"

import { UsersService } from "../../client"

const EmailConfirmation = () => {
  const token = new URLSearchParams(window.location.search).get("token")

  const verifyEmail = async (token: string) => {
    await UsersService.verifyEmailToken({ requestBody: { token: token } })
  }

  const mutation = useMutation({
    mutationFn: verifyEmail,
  })

  useEffect(() => {
    if (token) {
      mutation.mutate(token)
    }
  }, [token])

  return (
    <>
      <Container
        maxW={{ base: "xs", md: "md" }}
        flexDir="column"
        alignItems="stretch"
        justifyContent="center"
        centerContent
        gap={4}
      >
        {mutation.isSuccess && (
          <Box>
            <Text fontWeight="bolder" fontSize="2xl">
              Successful Email Verification
            </Text>
            <Text>
              Your email has been verified. You can now login to your account.
            </Text>
            <Link as={RouterLink} to="/" color="ui.main">
              Login
            </Link>
          </Box>
        )}

        {mutation.isError && (
          <Box>
            <Text fontWeight="bolder" fontSize="2xl">
              Email Verification Failed
            </Text>
            <Text>
              There was an error verifying your email. Please try again.
            </Text>
            <Text color="red.500">
              Error detail: {(mutation.error as any).body?.detail}
            </Text>
          </Box>
        )}
      </Container>
    </>
  )
}

export default EmailConfirmation
