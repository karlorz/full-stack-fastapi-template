import { Button, Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/organization/new")({
  component: NewOrg,
})

function NewOrg() {
  return (
    <>
      <Container maxW="full">
        <Heading size="md" textAlign={{ base: "center", md: "left" }} pt={12}>
          New Organization
        </Heading>
        <Button variant="primary" mt={4}>
          Create organization
        </Button>
      </Container>
    </>
  )
}
