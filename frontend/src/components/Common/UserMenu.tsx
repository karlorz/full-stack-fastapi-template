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
import { Link } from "@tanstack/react-router"
import { type ElementType, Suspense } from "react"
import { FaCog, FaSignOutAlt } from "react-icons/fa"

import useAuth, { useCurrentUser } from "@/hooks/useAuth"

interface MenuItemLinkProps {
  to: string
  icon: ElementType
  label: string
  onClick?: () => void
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

const CurrentUserEmail = () => {
  const currentUser = useCurrentUser()
  return currentUser?.email || ""
}

const UserMenu = () => {
  const bg = useColorModeValue("white", "ui.darkBg")
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
            as={Button}
            fontWeight="light"
            variant="outline"
            px={4}
            w="180px"
          >
            <Flex justify="space-between">
              <Box display="flex" alignItems="center">
                <Text as="div">
                  <Suspense
                    fallback={<SkeletonText noOfLines={1} width={100} />}
                  >
                    <Box isTruncated maxWidth="100px" data-testid="user-menu">
                      My Account
                    </Box>
                  </Suspense>
                </Text>
              </Box>
              <ChevronDownIcon alignSelf="center" />
            </Flex>
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
