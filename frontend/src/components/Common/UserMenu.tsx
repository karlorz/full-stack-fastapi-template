import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { LogOut, Settings } from "lucide-react"
import { Suspense } from "react"

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { SkeletonText } from "@/components/ui/skeleton"
import useAuth, { useCurrentUser } from "@/hooks/useAuth"

const CurrentUserEmail = () => {
  const currentUser = useCurrentUser()
  return currentUser?.email || ""
}

const UserMenu = () => {
  const { logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Desktop */}
      <Flex>
        <MenuRoot>
          <MenuTrigger asChild p={2}>
            <Button bg="whiteAlpha.200" w="100%" px={4} data-testid="user-menu">
              My Account
            </Button>
          </MenuTrigger>
          <MenuContent p={4}>
            <Text px={4} color="gray.500">
              Logged in as:
            </Text>
            <Suspense fallback={<SkeletonText noOfLines={1} width={100} />}>
              <Text truncate maxW="md" px={4} py={2}>
                <CurrentUserEmail />
              </Text>
            </Suspense>

            <MenuSeparator m={1} />
            <Link to="/settings">
              <MenuItem
                closeOnSelect
                value="user-settings"
                gap={2}
                py={2}
                style={{ cursor: "pointer" }}
              >
                <Settings size={16} />
                <Box>User Settings</Box>
              </MenuItem>
            </Link>

            <MenuSeparator m={1} />
            <MenuItem
              closeOnSelect
              value="logout"
              gap={2}
              py={2}
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <LogOut size={16} />
              <Box>Log Out</Box>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Flex>
    </>
  )
}

export default UserMenu
