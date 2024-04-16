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
  SkeletonText,
  Text,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Suspense } from "react"
import {
  FaCog,
  FaList,
  FaPlus,
  FaSignOutAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa"

import { OrganizationsService } from "../../client"
import useAuth, { useCurrentUser } from "../../hooks/useAuth"

const CurrentUser = () => {
  const currentUser = useCurrentUser()

  return currentUser?.full_name || ""
}

const UserMenu = () => {
  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => OrganizationsService.readOrganizations({}),
  })
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
                <Text mx={2}>
                  <Suspense
                    fallback={<SkeletonText noOfLines={1} width={100} />}
                  >
                    <CurrentUser />
                  </Suspense>
                </Text>
              </Box>
              <ChevronDownIcon alignSelf="center" />
            </Flex>
          </MenuButton>
          <MenuList p={4}>
            <MenuItem as={Link} to="/" gap={2} py={2}>
              <Icon as={FaUser} />
              <Suspense fallback={<SkeletonText noOfLines={1} width={100} />}>
                <CurrentUser />
              </Suspense>
            </MenuItem>
            {organizations?.data.slice(0, 3).map((org) => (
              <MenuItem as={Link} key={org.id} gap={2} py={2}>
                <Icon as={FaUsers} />
                {org.name}
              </MenuItem>
            ))}
            <MenuItem as={Link} to="/organization/all" gap={2} py={2}>
              <Icon as={FaList} />
              View all organizations
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
