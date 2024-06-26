import { Flex } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import BackgroundPanel from "../components/Auth/BackgroundPanel"
import EmailVerification from "../components/Auth/EmailVerification"

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
})

function VerifyEmail() {
  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
        <BackgroundPanel />
        <EmailVerification />
      </Flex>
    </>
  )
}
