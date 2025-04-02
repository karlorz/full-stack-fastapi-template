import { Box, Flex, Text } from "@chakra-ui/react"
import { Link, useRouterState } from "@tanstack/react-router"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

const ErrorElement = () => {
  const { location } = useRouterState()

  return (
    <Box minHeight="100vh" position="relative">
      <Flex
        height="100vh"
        align="center"
        justify="center"
        flexDir="column"
        color="gray.700"
        p={4}
      >
        <Flex
          alignItems="center"
          zIndex={1}
          flexDir={{ base: "column", md: "row" }}
          gap={4}
        >
          <AlertTriangle size={64} strokeWidth={1.5} />
          <Flex flexDir="column" align={{ base: "center", md: "start" }} p={4}>
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              mb={2}
              bgGradient="linear(to-r, red.600, orange.600)"
              bgClip="text"
            >
              Something Went Wrong
            </Text>
            <Text
              fontSize="md"
              color="gray.600"
              mb={4}
              textAlign={{ base: "center", md: "left" }}
            >
              An unexpected error occurred while processing your request at{" "}
              <Text as="span" fontWeight="semibold" color="red.600">
                {location.pathname}
              </Text>
            </Text>
            <Flex gap={4} flexDir={{ base: "column", md: "row" }}>
              <Link to="/">
                <Button variant="solid">Go to Home</Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

export default ErrorElement
