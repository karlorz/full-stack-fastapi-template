import { Box, Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense } from "react"

import Footer from "../components/Common/Footer"
import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import TeamInvitation from "../components/Invitations/TeamInvitation"
import Appearance from "../components/UserSettings/Appearance"
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
      <Flex minHeight="100vh" flexDirection="column">
        <Flex flex="1">
          {/* Sidebar */}
          <Box
            position="fixed"
            top="0"
            left="0"
            height="100vh"
            width={{ md: "250px" }}
            zIndex="3"
          >
            <Suspense>
              <Sidebar />
            </Suspense>
          </Box>
          <Flex flexDir="column" flex="1" ml={{ base: 0, md: "250px" }}>
            {/* Navbar */}
            <Box
              id="navbar"
              display={{ base: "none", md: "flex" }}
              justifyContent="flex-end"
              position="fixed"
              top="0"
              right="0"
              left={{ base: 0, md: "250px" }}
              height="64px"
              zIndex="2"
              p={4}
              gap="2"
            >
              <Appearance />
              <UserMenu />
            </Box>
            {/* Main Content */}
            <Box w="80%" p={10} mt="64px" mx="auto">
              <Outlet />
            </Box>
          </Flex>
        </Flex>
        <Footer />
      </Flex>
      <TeamInvitation />
    </>
  )
}
