import { Box, Container, Link, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { useEffect } from "react"

import { UsersService } from "../../client"

const EmailVerification = () => {
  const token = new URLSearchParams(window.location.search).get("token")

  const verifyEmail = async (token: string) => {
    await UsersService.verifyEmailToken({ requestBody: { token: token } })
  }

  const mutation = useMutation({
    mutationFn: verifyEmail,
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies(a): Including the mutation in the dependencies would cause an infinite loop
  useEffect(() => {
    // using a timeout here to prevent the mutation from firing multiple
    // times on StrictMode in dev
    const timeout = setTimeout(() => {
      if (token) {
        mutation.mutate(token)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [token])

  const loading = mutation.isPending || mutation.isIdle

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
        {loading && (
          <Box color="ui.lightText">
            <Text fontWeight="bolder" fontSize="2xl">
              Verifying Email
            </Text>
            <Text>Verifying your email, please wait...</Text>
          </Box>
        )}
        {mutation.isSuccess && (
          <Box data-testid="result" color="ui.lightText">
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
          <Box data-testid="error" color="ui.lightText">
            <Text fontWeight="bolder" fontSize="2xl">
              Email Verification Failed
            </Text>
            <Text>
              There was an error verifying your email. Please try again.
            </Text>
            <Text>Error detail: {(mutation.error as any).body?.detail}</Text>
          </Box>
        )}
      </Container>
    </>
  )
}

export default EmailVerification
