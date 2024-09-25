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

import { TeamsService } from "@/client"
import useAuth, { useCurrentUser } from "@/hooks/useAuth"
import { Route } from "@/routes/_layout/$team"

interface MenuItemLinkProps {
  to: string
  icon: React.ElementType
  label: string
  onClick?: () => void
}

const CurrentUser = () => {
  const currentUser = useCurrentUser()
  return currentUser?.full_name || ""
}

const MenuItemLink = ({ to, icon, label, onClick }: MenuItemLinkProps) => {
  const bgHover = useColorModeValue("#F0F0F0", "#4A5568")
  const bgMenu = useColorModeValue("white", "ui.darkBg")

  return (
    <MenuItem
      as={Link}
      to={to}
      gap={2}
      py={2}
      onClick={onClick}
      bg={bgMenu}
      _hover={{ bg: bgHover, borderRadius: "sm" }}
    >
      <Icon as={icon} />
      <Box isTruncated maxWidth="150px">
        {label}
      </Box>
    </MenuItem>
  )
}

const UserMenu = () => {
  const bg = useColorModeValue("white", "ui.darkBg")
  const { team } = Route.useParams()
  const { logout } = useAuth()
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  const currentTeam = teams?.data.find((t) => t.slug === team)

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Desktop */}
      <Flex>
        <Menu>
          <MenuButton
            as={Button}
            fontWeight="light"
            variant="outline"
            px={4}
            w="180px"
          >
            <Flex justify="space-between">
              <Box display="flex" alignItems="center">
                <Icon as={FaUser} />
                <Text mx={2} as="div">
                  <Suspense
                    fallback={<SkeletonText noOfLines={1} width={100} />}
                  >
                    <Box isTruncated maxWidth="150px">
                      {currentTeam?.name || <CurrentUser />}
                    </Box>
                  </Suspense>
                </Text>
              </Box>
              <ChevronDownIcon alignSelf="center" />
            </Flex>
          </MenuButton>
          <MenuList p={4} bg={bg}>
            {/* Teams */}
            {teams?.data.slice(0, 3).map((team, index) => (
              <MenuItemLink
                key={team.id}
                to={`/${team.slug}/`}
                icon={index === 0 ? FaUser : FaUsers}
                label={team.name}
              />
            ))}
            <MenuItemLink
              to="/teams/all"
              icon={FaList}
              label="View all teams"
            />
            <MenuItemLink
              to="/teams/new"
              icon={FaPlus}
              label="Create a new team"
            />
            <Divider />
            <MenuItemLink to="/settings" icon={FaCog} label="User Settings" />
            <Divider />
            <MenuItemLink
              to="#"
              icon={FaSignOutAlt}
              label="Log out"
              onClick={handleLogout}
            />
          </MenuList>
        </Menu>
      </Flex>
    </>
  )
}

export default UserMenu
