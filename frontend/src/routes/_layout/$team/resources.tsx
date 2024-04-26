import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/$team/resources")({
  component: Resources,
})

function Resources() {
  return (
    <Container maxW="full" p={12}>
      <Heading size="md" textAlign={{ base: "center", md: "left" }}>
        Resources
      </Heading>
    </Container>
  )
}
