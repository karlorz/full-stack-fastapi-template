import { Box, Button, Container, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useEffect } from "react"

import warning from "@/assets/failed.json"
import { UsersService } from "@/client"

const EmailVerification = () => {
  const router = useRouter()
  const handleOkClick = () => router.history.push("/")
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
        maxW={{ base: "md", md: "lg" }}
        p={{ base: 4, md: 12 }}
        color="ui.defaultText"
        h="70%"
        flexDir="column"
        alignItems="stretch"
        justifyContent="center"
        centerContent
        borderRadius="md"
        boxShadow="md"
        bg="ui.lightBg"
        zIndex="4"
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
            <Text fontWeight="bolder" fontSize="md">
              Successful Email Verification
            </Text>
            <Text>
              Your email has been verified. You can now login to your account.
            </Text>
            <Button mt={4} onClick={handleOkClick}>
              Ok
            </Button>
          </Box>
        )}

        {mutation.isError && (
          <Box data-testid="error">
            <Lottie
              animationData={warning}
              loop={false}
              style={{ width: 75, height: 75 }}
            />
            <Text fontWeight="bolder" fontSize="md" mt={4}>
              Email Verification Failed
            </Text>
            <Text>
              There was an error verifying your email. Please try again.
            </Text>
            <Text color="ui.danger">
              Error detail: {(mutation.error as any).body?.detail}
            </Text>
            <Button mt={4} onClick={handleOkClick}>
              Ok
            </Button>
          </Box>
        )}
      </Container>
    </>
  )
}

export default EmailVerification
