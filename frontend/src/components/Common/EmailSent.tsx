import { Box, Button, Container, Text } from "@chakra-ui/react"
import Lottie from "lottie-react"

import emailSent from "@/assets/email.json"
import { useRouter } from "@tanstack/react-router"

const EmailSent = ({ email }: { email: string }) => {
  const router = useRouter()
  const handleOkClick = () => router.history.push("/")

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
        gap={4}
        zIndex="4"
      >
        <Lottie
          animationData={emailSent}
          loop={false}
          style={{ width: 75, height: 75 }}
        />
        <Box data-testid="email-sent">
          <Text fontWeight="bolder" fontSize="md">
            One More Step
          </Text>
          <Text>
            We've sent you an email at <b>{email}</b>. Please follow the
            instructions. Check your spam folder if you don't see it in your
            inbox.
          </Text>
          <Button mt={4} onClick={handleOkClick}>
            Ok
          </Button>
        </Box>
      </Container>
    </>
  )
}

export default EmailSent
