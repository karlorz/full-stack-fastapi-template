import {
  Box,
  Button,
  Center,
  Code,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import EmptyBox from "/assets/images/empty-box.jpg"

export const Route = createFileRoute("/_layout/$team/apps/")({
  component: Apps,
})

function Apps() {
  // Just to test the UI
  const apps = []

  return (
    <Container maxW="full">
      <Heading size="md" textAlign={{ base: "center", md: "left" }} mb={6}>
        Apps
      </Heading>
      {apps.length > 0 ? (
        <></>
      ) : (
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          <Box
            w={{ base: "100%", md: "70%" }}
            mb={{ base: 4, md: 0 }}
            boxShadow="xs"
            borderRadius="lg"
            px={8}
            py={4}
          >
            <Center>
              {/* TODO: Replace image */}
              <Image
                w={{ base: "100%", md: "25%" }}
                src={EmptyBox}
                alt="Empty state"
                alignSelf="center"
              />
            </Center>
            <Text textAlign="center" mb={2}>
              You don't have any apps yet
            </Text>
            <Center>
              <Button as={RouterLink} to="/$team/apps/new">
                Create App
              </Button>
            </Center>
          </Box>
          <Box
            w={{ base: "100%", md: "30%" }}
            boxShadow="xs"
            borderRadius="lg"
            px={8}
            py={4}
          >
            <VStack spacing={4} align="flex-start">
              <Heading size="md">Quick Start with FastAPI CLI</Heading>
              <Text>
                FastAPI CLI is your primary tool for managing your apps. Before
                you start, make sure you have FastAPI CLI installed on your
                machine. You can install it using pip:
              </Text>
              <Text>
                <Code>pip install fastapi-cli</Code>
              </Text>
              <Heading size="sm">Getting started:</Heading>
              <Text>
                1. Initialize your app: <Code>fastapi init</Code>
              </Text>
              <Text>
                2. Deploy your app: <Code>fastapi deploy</Code>
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
