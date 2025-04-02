import { Box, Heading, Text } from "@chakra-ui/react"
import Lottie from "lottie-react"

import emailSent from "@/assets/email.json"

const EmailSent = ({ email }: { email: string }) => {
  return (
    <>
      <Box data-testid="email-sent">
        <Heading>One More Step</Heading>
        <Lottie
          animationData={emailSent}
          loop={false}
          style={{ width: 75, height: 75 }}
        />
        <Box>
          <Text>
            We've sent you an email at <b>{email}</b>. Please follow the
            instructions. Check your spam folder if you don't see it in your
            inbox.
          </Text>
        </Box>
      </Box>
    </>
  )
}

export default EmailSent
