import {
  Container,
  Flex,
  Heading,
  Separator,
  Skeleton,
  Text,
} from "@chakra-ui/react"
import { Fragment } from "react/jsx-runtime"
import CustomCard from "../Common/CustomCard"

const PendingApps = () => (
  <Container maxW="full" p={0}>
    <Heading size="xl" pb={2}>
      Apps
    </Heading>
    <Text textAlign="inherit">View and manage apps related to your team.</Text>
    <Flex justifyContent={{ base: "inherit", md: "end" }} my={4}>
      <Skeleton h="40px" w="100px" />
    </Flex>
    <CustomCard>
      <Flex direction="column">
        {[...Array(5)].map((_, index) => (
          <Fragment key={index}>
            <Flex align="center" mb={2} py={4}>
              <Skeleton h="20px" w="150px" />
            </Flex>
            <Separator />
          </Fragment>
        ))}
      </Flex>
    </CustomCard>
  </Container>
)

export default PendingApps
