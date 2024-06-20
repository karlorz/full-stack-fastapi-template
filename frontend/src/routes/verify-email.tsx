import { Flex } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import BackgroundPanel from "../components/Auth/BackgroundPanel"
import EmailConfirmation from "../components/Common/EmailConfirmation"

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
})

function VerifyEmail() {
  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
        <BackgroundPanel />
        <EmailConfirmation />
      </Flex>
    </>
  )
}
