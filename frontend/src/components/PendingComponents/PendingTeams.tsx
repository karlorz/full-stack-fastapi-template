import {
  Box,
  Container,
  Flex,
  Heading,
  Separator,
  Skeleton,
  Text,
} from "@chakra-ui/react"
import { Fragment } from "react"
import CustomCard from "../Common/CustomCard"

const PendingTeams = () => (
  <Container maxW="full" p={0}>
    <Box mb={10}>
      <Heading size="xl" textAlign={{ base: "center", md: "left" }} pb={2}>
        Teams
      </Heading>
      <Text>View all your teams</Text>
    </Box>

    <CustomCard>
      <Flex direction="column">
        {[...Array(5)].map((_, index) => (
          <Fragment key={index}>
            <Flex align="center" mb={2} py={4}>
              <Skeleton h="20px" w="150px" />
              <Skeleton h="20px" w="50px" ml={2} />
            </Flex>
            <Separator />
          </Fragment>
        ))}
      </Flex>
      <Flex justifyContent="flex-end" mt={4}>
        <Skeleton h="40px" w="100px" />
        <Skeleton h="40px" w="100px" ml={2} />
      </Flex>
    </CustomCard>
  </Container>
)

export default PendingTeams
