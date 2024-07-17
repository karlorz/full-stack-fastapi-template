import {
  Box,
  Code,
  Container,
  Flex,
  Heading,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/$team/projects")({
  component: Projects,
})

function Projects() {
  // Just to test the UI
  const projects = []

  return (
    <Container maxW="full" p={12} h="100%">
      <Heading size="md" textAlign={{ base: "center", md: "left" }} mb={6}>
        Projects
      </Heading>
      {projects.length > 0 ? (
        <></>
      ) : (
        <Flex direction={{ base: "column", md: "row" }}>
          <Box w={{ base: "100%", md: "70%" }} mb={{ base: 4, md: 0 }}>
            <Text textAlign="center">You don't have any projects yet</Text>
          </Box>
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            w={{ base: "100%", md: "30%" }}
          >
            <VStack spacing={4} align="flex-start">
              <Heading size="md">Quick Start with FastAPI CLI</Heading>
              <Text>
                FastAPI CLI is your primary tool for managing your projects.
                Before you start, make sure you have FastAPI CLI installed on
                your machine. You can install it using pip:
              </Text>
              <Text>
                <Code>pip install fastapi-cli</Code>
              </Text>
              <Heading size="sm">Getting started:</Heading>
              <Text>
                1. Initialize your project: <Code>fastapi init</Code>
              </Text>
              <Text>
                2. Deploy your project: <Code>fastapi deploy</Code>
              </Text>
              <Text>
                You can learn more in the{" "}
                <Link color="ui.main">FastAPI CLI documentation.</Link>
              </Text>
            </VStack>
          </Box>
        </Flex>
      )}
    </Container>
  )
}
