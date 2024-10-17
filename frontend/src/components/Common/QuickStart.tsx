import { Code, Heading, Link, Text, VStack } from "@chakra-ui/react"
import CustomCard from "./CustomCard"

const QuickStart = () => {
  return (
    <CustomCard w={{ base: "100%", md: "40%" }} data-testid="fastapi-cli">
      <VStack spacing={4} align="flex-start">
        <Heading size="sm">Quick Start with FastAPI CLI</Heading>
        <Text>
          FastAPI CLI is your primary tool for managing your apps. Before you
          start, make sure you have FastAPI CLI installed on your machine. You
          can install it using pip:
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
          <Link color="main.dark" fontWeight="bold">
            FastAPI CLI documentation
          </Link>
          .
        </Text>
      </VStack>
    </CustomCard>
  )
}

export default QuickStart
