import { Container, HStack, Link, Text, VStack } from "@chakra-ui/react"
import React from "react"

import { Button } from "../ui/button"

const CurrentPlan = () => {
  return (
    <Container p={8} borderRadius="lg">
      <HStack gap={4} flexDirection={["column", "row"]}>
        <VStack gap={4} align="start">
          <Text fontSize="md" fontWeight="bold">
            Team
          </Text>
          <Text>
            Current plan ends on{" "}
            <Text as="span" fontWeight="bold">
              June 23, 2024
            </Text>
            .
          </Text>
          <Text>
            Need any help? Contact us at{" "}
            <Text as="span" fontWeight="bold">
              billing@fastapilabs.com
            </Text>
          </Text>
          <Link color="error.base">Cancel Subscription</Link>
        </VStack>
        <Button variant="outline">Upgrade</Button>
      </HStack>
    </Container>
  )
}

export default CurrentPlan
