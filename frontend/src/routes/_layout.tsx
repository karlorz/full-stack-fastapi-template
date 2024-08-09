import { Box, Divider, Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense } from "react"

import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import TeamInvitation from "../components/Invitations/TeamInvitation"
import { isLoggedIn } from "../hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async ({ location }) => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
  },
})

function Layout() {
  return (
    <>
      <Flex maxW="large" h="auto">
        {/* Sidebar */}
        <Box
          position="fixed"
          top="0"
          left="0"
          height="100vh"
          width={{ md: "250px" }}
          zIndex="3"
          bg="white"
        >
          <Suspense>
            <Sidebar />
          </Suspense>
        </Box>
        <Flex flexDir="column" flex="1" ml="250px">
          {/* Navbar */}
          <Box
            display={{ base: "none", md: "flex" }}
            justifyContent="flex-end"
            position="fixed"
            top="0"
            right="0"
            left={{ base: 0, md: "250px" }}
            h="5%"
            zIndex="2"
            p={4}
            bg="white"
          >
            <UserMenu />
          </Box>
          <Divider />
          {/* Main Content */}
          <Box w="100%" mt="5%" p={10}>
            <Outlet />
          </Box>
        </Flex>
      </Flex>
      <TeamInvitation />
    </>
  )
}
