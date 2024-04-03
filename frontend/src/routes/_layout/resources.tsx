import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/resources")({
  component: Resources,
})

function Resources() {
  return (
    <Container maxW="full">
      <Heading size="md" textAlign={{ base: "center", md: "left" }} py={12}>
        Resources
      </Heading>
    </Container>
  )
}
