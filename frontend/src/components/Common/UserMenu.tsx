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
  useColorModeValue,
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

import { TeamsService } from "../../client"
import useAuth, { useCurrentUser } from "../../hooks/useAuth"

const CurrentUser = () => {
  const currentUser = useCurrentUser()

  return currentUser?.full_name || ""
}

const UserMenu = () => {
  const bgHover = useColorModeValue("#F0F0F0", "#4A5568")
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
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
            w="auto"
          >
            <Flex justify="space-between">
              <Box display="flex" alignItems="center">
                <Icon as={FaUser} />
                <Text mx={2} as="div">
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
            {/* Personal Team */}
            <MenuItem
              as={Link}
              to="/"
              gap={2}
              py={2}
              _hover={{ bg: bgHover, borderRadius: "12px" }}
            >
              <Icon as={FaUser} />
              <Suspense
                fallback={<SkeletonText noOfLines={1} width={100} as="span" />}
              >
                <CurrentUser />
              </Suspense>
            </MenuItem>
            {/* Teams */}
            {teams?.data.slice(1, 3).map((team) => (
              <MenuItem
                as={Link}
                key={team.id}
                gap={2}
                py={2}
                _hover={{ bg: bgHover, borderRadius: "12px" }}
              >
                <Icon as={FaUsers} />
                {team.name}
              </MenuItem>
            ))}
            <MenuItem
              as={Link}
              to="/teams/all"
              gap={2}
              py={2}
              _hover={{ bg: bgHover, borderRadius: "12px" }}
            >
              <Icon as={FaList} />
              View all teams
            </MenuItem>
            <MenuItem
              as={Link}
              to="/teams/new"
              gap={2}
              py={2}
              _hover={{ bg: bgHover, borderRadius: "12px" }}
            >
              <Icon as={FaPlus} />
              Create a new team
            </MenuItem>
            <Divider />
            <MenuItem
              as={Link}
              to="/settings"
              gap={2}
              _hover={{ bg: bgHover, borderRadius: "12px" }}
            >
              <Icon as={FaCog} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              gap={2}
              _hover={{ bg: bgHover, borderRadius: "12px" }}
            >
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
