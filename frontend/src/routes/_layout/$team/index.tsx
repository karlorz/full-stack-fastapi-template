import { Box, Container, SkeletonText, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

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
    <>
      <Container maxW="full" p={12}>
        <Box>
          <Text fontSize="2xl">
            Hi,{" "}
            <Suspense fallback={<SkeletonText noOfLines={1} width={20} />}>
              <CurrentUser />
            </Suspense>{" "}
            👋🏼
          </Text>
          <Text>Welcome back, nice to see you again!</Text>
        </Box>
      </Container>
    </>
  )
}
