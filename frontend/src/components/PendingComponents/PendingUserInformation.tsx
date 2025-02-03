import {
  Box,
  Circle,
  Container,
  Flex,
  Heading,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react"
import CustomCard from "../Common/CustomCard"

const PendingUserInformation = () => (
  <Container maxW="full" my={4} px={0} pt={10}>
    <CustomCard title="Full Name">
      <Skeleton h="20px" w={{ base: "100%", md: "50%" }} />
    </CustomCard>
    <CustomCard title="Email">
      <Skeleton h="20px" w={{ base: "100%", md: "50%" }} />
    </CustomCard>
    <CustomCard title="Password">
      <Container maxW="full" p={0}>
        <Text mb={4}>Change your password.</Text>
        <VStack gap={4} w="50%">
          <Skeleton h="40px" w="100%" />
          <Skeleton h="40px" w="100%" />
          <Skeleton h="40px" w="100%" />
        </VStack>
        <Skeleton h="40px" w="100px" mt={4} />
      </Container>
    </CustomCard>
    <CustomCard>
      <Container maxW="full" p={0}>
        <Flex
          align="center"
          justify="space-between"
          flexDir={{ base: "column", md: "row" }}
        >
          <Flex
            align={{ base: "start", md: "center" }}
            gap={4}
            flexDir={{ base: "column", md: "row" }}
          >
            <Circle size="40px" bg="gray.200" />
            <Box>
              <Heading size="md" fontWeight="bold" mb={4}>
                Danger Zone
              </Heading>
              <Skeleton h="16px" w="400px" />
            </Box>
          </Flex>
          <Skeleton h="40px" w="100px" />
        </Flex>
      </Container>
    </CustomCard>
  </Container>
)

export default PendingUserInformation
