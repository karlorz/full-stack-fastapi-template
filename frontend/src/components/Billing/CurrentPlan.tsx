import {
  Button,
  Container,
  HStack,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react"

const CurrentPlan = () => {
  const borderColor = useColorModeValue("#e4e5eb", "#2a2a2a")

  return (
    <Container p={8} borderRadius="lg" border={`1px solid ${borderColor}`}>
      <HStack spacing={4} flexDirection={["column", "row"]}>
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
          <Link color="ui.danger">Cancel Subscription</Link>
        </VStack>
        <Button variant="outline">Upgrade</Button>
      </HStack>
    </Container>
  )
}

export default CurrentPlan
