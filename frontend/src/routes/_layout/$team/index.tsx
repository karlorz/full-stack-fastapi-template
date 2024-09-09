import {
  Box,
  Button,
  Container,
  Flex,
  SkeletonText,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

import CustomCard from "../../../components/Common/CustomCard"
import { useCurrentUser } from "../../../hooks/useAuth"

export const Route = createFileRoute("/_layout/$team/")({
  component: Dashboard,
})

const CurrentUser = () => {
  const currentUser = useCurrentUser()

  return currentUser?.full_name || currentUser?.email
}

function Dashboard() {
  return (
    <Container maxW="full">
      <CustomCard data-testid="result">
        <Box fontSize="2xl" isTruncated maxWidth="250px">
          Hi,{" "}
          <Suspense fallback={<SkeletonText noOfLines={1} width={20} />}>
            <CurrentUser />
          </Suspense>{" "}
        </Box>
        <Text>Welcome back, nice to see you again!</Text>
      </CustomCard>
      <Flex direction={{ base: "column", md: "row" }} gap={4}>
        <CustomCard title="Last Deployment" w={{ base: "100%", md: "55%" }}>
          <Text mt={2}>
            Last deployment was successful. Your app is up and running.
          </Text>
          <Button mt={4}>View Deployment</Button>
        </CustomCard>

        {/* TODO: Finalize once real data is available */}
        <CustomCard title="Statistics" w={{ base: "100%", md: "45%" }}>
          <StatGroup mt={2}>
            <Stat>
              <StatLabel>Deployments</StatLabel>
              <StatNumber>34</StatNumber>
              <StatHelpText>Last 30 days</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Errors</StatLabel>
              <StatNumber>5</StatNumber>
              <StatHelpText>Last 30 days</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Uptime</StatLabel>
              <StatNumber>99.9%</StatNumber>
              <StatHelpText>Last 30 days</StatHelpText>
            </Stat>
          </StatGroup>
        </CustomCard>
      </Flex>
    </Container>
  )
}
