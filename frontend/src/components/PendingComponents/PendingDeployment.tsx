import { Box, Container, Flex, Heading, Skeleton } from "@chakra-ui/react"
import CustomCard from "../Common/CustomCard"

const PendingDeployment = () => (
  <Container maxW="full" p={0}>
    <Flex alignItems="center">
      <Heading size="xl" pb={2}>
        Deployment Details
      </Heading>
    </Flex>

    <Box mb={4}>
      <Skeleton h="20px" w="200px" />
      <Flex alignItems="center" gap={2} mt={2}>
        <Skeleton h="20px" w="50px" />
        <Skeleton h="20px" w="100px" />
      </Flex>
    </Box>

    <CustomCard title="Logs">
      <Skeleton h="400px" />
    </CustomCard>
  </Container>
)

export default PendingDeployment
