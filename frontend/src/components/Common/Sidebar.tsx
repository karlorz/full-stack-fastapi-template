import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { FaBars } from "react-icons/fa"

import { LogOut } from "@/assets/icons.tsx"
import type { TeamsPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import { Route } from "@/routes/_layout/$team"
import { useEffect } from "react"
import SidebarItems from "./SidebarItems"

const Sidebar = ({ teams }: { teams: TeamsPublic }) => {
  const { team } = Route.useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
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
      <IconButton
        icon={<FaBars />}
        onClick={onOpen}
        display={{ base: "flex", md: "none" }}
        aria-label="Open Menu"
        position="absolute"
        fontSize="20px"
        m={4}
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="280px">
          <DrawerCloseButton />
          <DrawerBody py={8}>
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
        </DrawerContent>
      </Drawer>

      {/* Desktop */}
      <Box
        id="sidebar"
        borderRadius="md"
        position="sticky"
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
