import {
  Box,
  Container,
  Flex,
  List,
  ListIcon,
  ListItem,
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

import { FaCheck } from "react-icons/fa"
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
  const activities = [
    "User1 logged in",
    "App XYZ was updated",
    "New user User2 registered",
  ]

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
        <CustomCard title="Recent Activity" w={{ base: "100%", md: "55%" }}>
          <Text mt={2}>
            View the latest activities and logs related to your apps.
          </Text>
          <List spacing={3} mt={4}>
            {activities.map((activity, index) => (
              <ListItem key={index}>
                <ListIcon as={FaCheck} color="ui.main" />
                {activity}
              </ListItem>
            ))}
          </List>
        </CustomCard>

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
