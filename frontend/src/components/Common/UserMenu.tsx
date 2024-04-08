import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FaCog, FaPlus, FaSignOutAlt, FaUser, FaUsers } from "react-icons/fa"

import type { UserPublic } from "../../client"
import useAuth from "../../hooks/useAuth"

const UserMenu = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Desktop */}
      <Flex mr={8}>
        <Menu>
          <MenuButton
            as={Button}
            fontWeight="light"
            variant="unstyled"
            width="auto"
          >
            <Flex justify="space-between">
              <Box display="flex" alignItems="center">
                <Icon as={FaUser} />
                <Text mx={2}>{currentUser?.full_name}</Text>
              </Box>
              <ChevronDownIcon alignSelf="center" />
            </Flex>
          </MenuButton>
          <MenuList p={4}>
            <MenuItem as={Link} to="/" gap={2} py={2}>
              <Icon as={FaUser} />
              {currentUser?.full_name}
            </MenuItem>
            <MenuItem as={Link} to="/" gap={2} py={2}>
              <Icon as={FaUsers} />
              FastAPI Labs
            </MenuItem>
            <MenuItem as={Link} to="/organization/new" gap={2} py={2}>
              <Icon as={FaPlus} />
              Create a new organization
            </MenuItem>
            <Divider />
            <MenuItem as={Link} to="/settings" gap={2}>
              <Icon as={FaCog} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} gap={2}>
              <Icon as={FaSignOutAlt} />
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </>
  )
}

export default UserMenu
