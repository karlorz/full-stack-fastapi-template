import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/$team/help")({
  component: Help,
})

function Help() {
  return (
    <Container maxW="full" p={12}>
      <Heading size="md" textAlign={{ base: "center", md: "left" }}>
        Help
      </Heading>
    </Container>
  )
}
