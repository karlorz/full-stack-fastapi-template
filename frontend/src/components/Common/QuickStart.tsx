import { Code, Heading, Text, VStack } from "@chakra-ui/react"

import CustomCard from "./CustomCard"

const QuickStart = () => {
  return (
    <CustomCard w={{ base: "100%", md: "40%" }} data-testid="fastapi-cli">
      <VStack gap={4} align="flex-start">
        <Heading size="md">Quick Start with FastAPI CLI</Heading>
        <Text>
          FastAPI CLI is your primary tool for managing your apps. Before you
          start, make sure you have FastAPI CLI installed on your machine. You
          can install it using pip:
        </Text>
        <Text>
          <Code>pip install fastapi-cli</Code>
        </Text>
        <Heading size="md">Getting started:</Heading>
        <Text>
          1. Initialize your app: <Code>fastapi init</Code>
        </Text>
        <Text>
          2. Deploy your app: <Code>fastapi deploy</Code>
        </Text>
        <Text>
          You can learn more in the{" "}
          <a
            href="https://fastapi.tiangolo.com/fastapi-cli/"
            className="main-link"
            target="_blank"
            rel="noreferrer"
          >
            FastAPI CLI documentation
          </a>
          .
        </Text>
      </VStack>
    </CustomCard>
  )
}

export default QuickStart
