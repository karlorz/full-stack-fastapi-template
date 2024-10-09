import { Box, Center, Flex, Image } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense } from "react"

import logo from "@/assets/logo-text-white.svg"
import { TeamsService } from "@/client"
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
  loader: async ({ context }) => {
    const teams = await context.queryClient.fetchQuery({
      queryFn: () => TeamsService.readTeams({}),
      queryKey: ["teams"],
    })

    return { teams }
  },
})

function Layout() {
  const { teams } = Route.useLoaderData()

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
              <Sidebar teams={teams} />
            </Suspense>
          </Box>
          <Flex flexDir="column" flex="1" ml={{ base: 0, md: "250px" }}>
            {/* Navbar */}
            <Box
              bg="ui.gradient"
              id="navbar"
              display={{ base: "none", md: "flex" }}
              justifyContent="space-between"
              position="fixed"
              top="0"
              right="0"
              w="100%"
              h="64px"
              zIndex="2"
              p={4}
            >
              <Center>
                <Image src={logo} alt="Logo" p={4} width={180} />
              </Center>
              <Flex gap={2}>
                <Appearance />
                <UserMenu />
              </Flex>
            </Box>
            {/* Main Content */}
            <Box w="80%" p={{ base: 0, md: 10 }} mt="64px" mx="auto">
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
