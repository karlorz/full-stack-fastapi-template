import { Container, Heading, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import UserInformation from "../../components/UserSettings/UserInformation"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  return (
    <Container maxW="full" p={0}>
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pb={2}>
        User Settings
      </Heading>
      <Text>View and manage settings related to your account.</Text>
      <UserInformation />
    </Container>
  )
}
