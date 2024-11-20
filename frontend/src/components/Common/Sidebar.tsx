import { Box, Flex, IconButton, Text, useDisclosure } from "@chakra-ui/react"
import { FaBars } from "react-icons/fa"

import { LogOut } from "@/assets/icons.tsx"
import type { TeamsPublic } from "@/client"
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer"
import useAuth from "@/hooks/useAuth"
import { Route } from "@/routes/_layout/$team"
import { useEffect } from "react"
import SidebarItems from "./SidebarItems"

const Sidebar = ({ teams }: { teams: TeamsPublic }) => {
  const { team } = Route.useParams()
  const { onClose } = useDisclosure()
  const { logout } = useAuth()

  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const currentTeamSlug =
    team || localStorage.getItem("current_team") || personalTeam?.slug || ""

  useEffect(() => {
    if (currentTeamSlug) {
      localStorage.setItem("current_team", currentTeamSlug)
    }
  }, [currentTeamSlug])

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile */}
      <DrawerRoot size="sm">
        <DrawerBackdrop />
        <DrawerTrigger asChild>
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Open Menu"
            position="absolute"
            fontSize="20px"
            m={4}
          >
            <FaBars />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent maxW="280px">
          <DrawerCloseTrigger />
          <DrawerBody>
            <Flex flexDir="column" justify="space-between">
              <Box>
                <SidebarItems
                  onClose={onClose}
                  teams={teams}
                  currentTeamSlug={currentTeamSlug}
                />
                <Flex
                  as="button"
                  onClick={handleLogout}
                  alignItems="center"
                  gap={4}
                  px={4}
                  py={2}
                >
                  <LogOut />
                  <Text>Log Out</Text>
                </Flex>
              </Box>
            </Flex>
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      {/* Desktop */}

      <Box
        bg="bg.panel"
        id="sidebar"
        display={{ base: "none", md: "flex" }}
        minW="280px"
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
