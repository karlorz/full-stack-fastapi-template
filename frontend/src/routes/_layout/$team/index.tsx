import { Box, Button, Container, Flex, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

import CustomCard from "@/components/Common/CustomCard"
import { SkeletonText } from "@/components/ui/skeleton"
import {
  StatHelpText,
  StatLabel,
  StatRoot,
  StatValueText,
} from "@/components/ui/stat"
import { useCurrentUser } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/$team/")({
  component: Dashboard,
})

const CurrentUser = () => {
  const currentUser = useCurrentUser()

  return currentUser?.full_name || currentUser?.email
}

function Dashboard() {
  return (
    <Container maxW="full" p={0}>
      <CustomCard data-testid="result">
        <Box fontSize="2xl" truncate maxWidth="250px">
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
          <Button variant="outline" mt={4}>
            View Deployment
          </Button>
        </CustomCard>

        {/* TODO: Finalize once real data is available */}

        <CustomCard title="Statistics" w={{ base: "100%", md: "45%" }}>
          <StatRoot
            mt={2}
            display="flex"
            flexDir={{ base: "column", md: "row" }}
          >
            <StatRoot>
              <StatLabel>Deployments</StatLabel>
              <StatValueText value={34} />
              <StatHelpText>Last 30 days</StatHelpText>
            </StatRoot>
            <StatRoot>
              <StatLabel>Errors</StatLabel>
              <StatValueText value={5} />
              <StatHelpText>Last 30 days</StatHelpText>
            </StatRoot>
            <StatRoot>
              <StatLabel>Uptime</StatLabel>
              <StatValueText
                value={99.9}
                formatOptions={{ style: "percent" }}
              />
              <StatHelpText>Last 30 days</StatHelpText>
            </StatRoot>
          </StatRoot>
        </CustomCard>
      </Flex>
    </Container>
  )
}
