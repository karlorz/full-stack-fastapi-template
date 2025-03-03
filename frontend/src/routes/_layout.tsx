import { Box, Center, Flex, Image } from "@chakra-ui/react"
import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense } from "react"

import logo from "@/assets/logo-text-white.svg"
import { TeamsService } from "@/client"
import { useSuspenseQuery } from "@tanstack/react-query"
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
    await context.queryClient.ensureQueryData({
      queryFn: () => TeamsService.readTeams({}),
      queryKey: ["teams"],
    })
  },
})

function Layout() {
  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  return (
    <>
      <Flex minHeight="100vh" flexDirection="column" bg="bg.subtle">
        {/* Sidebar */}
        <Box
          position="fixed"
          top="0"
          left="0"
          height="100vh"
          width={{ md: "280px" }}
        >
          <Suspense>
            <Sidebar teams={teams} />
          </Suspense>
        </Box>
        <Flex flexDir="column" flex="1" ml={{ base: 0, md: "250px" }}>
          {/* Navbar */}
          <Box
            bg="gradient"
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
              <Link to="/">
                <Image src={logo} alt="Logo" p={4} width={180} />
              </Link>
            </Center>
            <Flex gap={2} alignItems="center">
              <Appearance />
              <UserMenu />
            </Flex>
          </Box>
          {/* Main Content */}
          <Flex
            w={{ base: "100%", md: "80%" }}
            flexDir="column"
            flex={1}
            mt={{ base: "0", md: "64px" }}
            mx="auto"
            p={10}
          >
            <Outlet />
          </Flex>
        </Flex>
        <Footer />
      </Flex>
      <TeamInvitation />
    </>
  )
}
