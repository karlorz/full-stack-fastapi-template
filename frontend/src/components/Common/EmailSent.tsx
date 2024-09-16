import { Box, Container, Text } from "@chakra-ui/react"

const EmailSent = ({ email }: { email: string }) => {
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
        <Box data-testid="email-sent" color="ui.lightText">
          <Text fontWeight="bolder" fontSize="2xl">
            One More Step
          </Text>
          <Text>
            We've sent you an email at {email}. Please follow the instructions.
          </Text>
        </Box>
      </Container>
    </>
  )
}

export default EmailSent
