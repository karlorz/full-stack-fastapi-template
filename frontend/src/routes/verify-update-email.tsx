import { Flex } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import UpdateEmailVerification from "../components/UserSettings/UpdateEmailVerification"

export const Route = createFileRoute("/verify-update-email")({
  component: VerifyUpdateEmail,
})

function VerifyUpdateEmail() {
  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
        <UpdateEmailVerification />
      </Flex>
    </>
  )
}
