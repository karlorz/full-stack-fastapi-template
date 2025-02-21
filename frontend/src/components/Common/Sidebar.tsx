import {
  Box,
  DrawerContext,
  Flex,
  IconButton,
  Separator,
  Text,
} from "@chakra-ui/react"
import { FaBars } from "react-icons/fa"

import { LogOut, User } from "@/assets/icons.tsx"
import type { TeamsPublic } from "@/client"
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer"
import useAuth, { useCurrentUser } from "@/hooks/useAuth"
import { Route } from "@/routes/_layout/$team"
import { Link } from "@tanstack/react-router"
import { Suspense, useEffect } from "react"
import { SkeletonText } from "../ui/skeleton"
import SidebarItems from "./SidebarItems"

const Sidebar = ({ teams }: { teams: TeamsPublic }) => {
  const { team } = Route.useParams()
  const { logout } = useAuth()

  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const currentTeamSlug =
    team || localStorage.getItem("current_team") || personalTeam?.slug || ""

  useEffect(() => {
    if (currentTeamSlug) {
      localStorage.setItem("current_team", currentTeamSlug)
    }
  }, [currentTeamSlug])

  const CurrentUserEmail = () => {
    const currentUser = useCurrentUser()
    return currentUser?.email || ""
  }

  return (
    <>
      {/* Mobile */}
      <DrawerRoot size="full" placement="start">
        <DrawerTrigger asChild>
          <IconButton
            variant="ghost"
            color="inherit"
            display={{ base: "flex", md: "none" }}
            aria-label="Open Menu"
            position="fixed"
            m={1}
          >
            <FaBars />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent maxW="xs">
          <DrawerCloseTrigger />
          <DrawerContext>
            {(store) => (
              <DrawerBody>
                <SidebarItems
                  onClose={() => store.setOpen(false)}
                  teams={teams}
                  currentTeamSlug={currentTeamSlug}
                />
                <Separator my={4} />
                <Flex flexDir="column">
                  <Text px={4} color="gray.500">
                    Logged in as:
                  </Text>
                  <Suspense
                    fallback={<SkeletonText noOfLines={1} width={100} />}
                  >
                    <Text truncate px={4} py={2}>
                      <CurrentUserEmail />
                    </Text>
                  </Suspense>
                </Flex>
                <Link to="/settings" onClick={() => store.setOpen(false)}>
                  <Flex
                    gap={4}
                    px={4}
                    py={2}
                    _hover={{
                      background: "gray.subtle",
                    }}
                    alignItems="center"
                    fontSize="sm"
                  >
                    <User />
                    User Settings
                  </Flex>
                </Link>
                <Flex
                  as="button"
                  onClick={() => {
                    logout()
                  }}
                  alignItems="center"
                  gap={4}
                  px={4}
                  py={2}
                >
                  <LogOut />
                  <Text>Log Out</Text>
                </Flex>
              </DrawerBody>
            )}
          </DrawerContext>

          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      {/* Desktop */}

      <Box
        bg="bg.panel"
        id="sidebar"
        display={{ base: "none", md: "flex" }}
        minW="xxs"
        h="100vh"
        mt="64px"
        p={6}
      >
        <Box w="100%">
          <SidebarItems teams={teams} currentTeamSlug={currentTeamSlug} />
        </Box>
      </Box>
    </>
  )
}

export default Sidebar
