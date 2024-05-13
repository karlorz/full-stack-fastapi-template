import { Button, Container, HStack, Link, Text, VStack } from "@chakra-ui/react"

const CurrentPlan = () => {
  return (
    <Container bg="ui.light" p={8} borderRadius="lg">
      <HStack spacing={4}>
        <VStack spacing={4} align="start">
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
          <Link color="red.600">Cancel Subscription</Link>
        </VStack>
        <Button variant="primary" size="sm" fontSize="sm" p={4}>
          Upgrade Plan
        </Button>
      </HStack>
    </Container>
  )
}

export default CurrentPlan
