import { Box, Container, Flex, Skeleton } from "@chakra-ui/react"
import CustomCard from "../Common/CustomCard"
import { SkeletonText } from "../ui/skeleton"

const PendingDashboard = () => (
  <Container maxW="full" p={0}>
    <CustomCard data-testid="result">
      <Box fontSize="2xl" truncate maxW="250px">
        <Skeleton height="40px" w="250px" />
      </Box>
      <SkeletonText mt="4" noOfLines={1} gap={4} w="200px" />
    </CustomCard>
    <Flex direction={{ base: "column", md: "row" }} gap={4}>
      <CustomCard w={{ base: "100%", md: "55%" }}>
        <Skeleton height="20px" w="100%" />
      </CustomCard>
      <CustomCard w={{ base: "100%", md: "45%" }}>
        <Skeleton height="20px" w="100%" />
      </CustomCard>
    </Flex>
  </Container>
)

export default PendingDashboard
