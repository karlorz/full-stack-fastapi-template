import { Box, Divider, Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import Searchbar from "../components/Common/Searchbar"
import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import { isLoggedIn } from "../hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  return (
    <Flex maxW="large" h="auto" position="relative">
      <Sidebar />
      <Flex flexDir="column" flex="1">
        {/* Navbar */}
        <Box
          display={{ base: "none", md: "flex" }}
          alignItems="center"
          justifyContent="space-between"
          m={4}
        >
          <Searchbar />
          <UserMenu />
        </Box>
        <Divider />
        <Outlet />
      </Flex>
    </Flex>
  )
}
