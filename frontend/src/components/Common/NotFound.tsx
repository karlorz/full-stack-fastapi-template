import { Container, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

const NotFound = () => {
  return (
    <>
      <Container
        h="100vh"
        alignItems="stretch"
        justifyContent="center"
        textAlign="center"
        maxW="sm"
        centerContent
      >
        <Text
          fontSize="8xl"
          color="main.dark"
          fontWeight="bold"
          lineHeight="1"
          mb={4}
        >
          404
        </Text>
        <Text fontSize="md">Oops!</Text>
        <Text fontSize="md">Page not found.</Text>
        <Link to="/">
          <Button variant="outline" mt={4}>
            Go back
          </Button>
        </Link>
      </Container>
    </>
  )
}

export default NotFound
