import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  SkeletonText,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { type ElementType, Suspense } from "react"

import { LogOut, Settings } from "@/assets/icons.tsx"
import useAuth, { useCurrentUser } from "@/hooks/useAuth"

interface MenuItemLinkProps {
  to?: string
  icon: ElementType
  label: string
  onClick?: () => void
  as?: ElementType
}

const MenuItemLink = ({
  to,
  icon,
  label,
  onClick,
  as = Link,
}: MenuItemLinkProps) => {
  const bgHover = useColorModeValue("#F3F3F3", "#252525")
  const bgMenu = useColorModeValue("white", "background.dark")

  return (
    <MenuItem
      as={as}
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

const CurrentUserEmail = () => {
  const currentUser = useCurrentUser()
  return currentUser?.email || ""
}

const UserMenu = () => {
  const bg = useColorModeValue("white", "background.dark")
  const { logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Desktop */}
      <Flex>
        <Menu>
          <MenuButton
            bg="whiteAlpha.200"
            color="whiteAlpha.900"
            _hover={{ bg: "whiteAlpha.300" }}
            _expanded={{ bg: "whiteAlpha.300" }}
            as={Button}
            className="navbar-button"
            w="100%"
            px={4}
            data-testid="user-menu"
          >
            My Account
          </MenuButton>
          <MenuList p={4} bg={bg}>
            <Text px={4} color="gray.500">
              Logged in as:
            </Text>
            <Suspense fallback={<SkeletonText noOfLines={1} width={100} />}>
              <Text isTruncated maxWidth="200px" px={4} py={2}>
                <CurrentUserEmail />
              </Text>
            </Suspense>
            <MenuDivider m={1} />
            <MenuItemLink
              to="/settings"
              icon={Settings}
              label="User Settings"
            />
            <MenuDivider m={1} />
            <MenuItemLink
              as="button"
              icon={LogOut}
              label="Log Out"
              onClick={handleLogout}
            />
          </MenuList>
        </Menu>
      </Flex>
    </>
  )
}

export default UserMenu
