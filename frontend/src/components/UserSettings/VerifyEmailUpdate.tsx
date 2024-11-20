import { Box, Container, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { useEffect } from "react"

import { UsersService } from "../../client"

const VerifyEmailUpdate = () => {
  const token = new URLSearchParams(window.location.search).get("token")

  const verifyEmail = async (token: string) => {
    await UsersService.verifyUpdateEmailToken({ requestBody: { token: token } })
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
          <Box>
            <Text fontWeight="bolder" fontSize="2xl">
              Verifying Email
            </Text>
            <Text>Verifying your email, please wait...</Text>
          </Box>
        )}
        {mutation.isSuccess && (
          <Box data-testid="result">
            <Text fontWeight="bolder" fontSize="2xl">
              Success!
            </Text>
            <Text>Your email address has been updated successfully.</Text>
            <RouterLink className="main-link" to="/">
              Go to Your Dashboard
            </RouterLink>
          </Box>
        )}

        {mutation.isError && (
          <Box data-testid="error">
            <Text fontWeight="bolder" fontSize="2xl">
              Email Verification Failed
            </Text>
            <Text>
              There was an error verifying your email. Please try again.
            </Text>
            <Text color="error.base">
              Error detail: {(mutation.error as any).body?.detail}
            </Text>
          </Box>
        )}
      </Container>
    </>
  )
}

export default VerifyEmailUpdate
