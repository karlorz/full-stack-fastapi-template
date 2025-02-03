import {
  Box,
  Circle,
  Container,
  Flex,
  Heading,
  Separator,
  Skeleton,
} from "@chakra-ui/react"
import { Fragment } from "react/jsx-runtime"
import CustomCard from "../Common/CustomCard"

const PendingApp = () => (
  <Container maxW="full" p={0}>
    <Heading size="xl" pb={2}>
      <Skeleton h="40px" w="300px" />
    </Heading>
    <Box pb={10}>
      <Skeleton h="20px" w="200px" />
      <Box pt={10}>
        <CustomCard title="Deployments">
          <Flex direction="column">
            {[...Array(5)].map((_, index) => (
              <Fragment key={index}>
                <Flex align="center" justify="space-between" mb={2} p={4}>
                  <Flex justify="space-between" w="100%">
                    <Flex direction="column">
                      <Skeleton h="20px" w="150px" mb={2} />
                      <Skeleton h="20px" w="100px" />
                    </Flex>
                    <Skeleton h="20px" w="100px" />
                  </Flex>
                </Flex>
                <Separator />
              </Fragment>
            ))}
          </Flex>
        </CustomCard>
        <CustomCard title="Environment Variables">
          <Skeleton h="250px" w="100%" />
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
      </Box>
    </Box>
  </Container>
)

export default PendingApp
