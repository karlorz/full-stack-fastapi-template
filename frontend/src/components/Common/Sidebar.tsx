import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Text,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react"
import { FaBars, FaSignOutAlt } from "react-icons/fa"

import LogoLight from "../../assets/logo-mosaic-white.svg"
import LogoDark from "../../assets/logo-mosaic.svg"
import useAuth from "../../hooks/useAuth"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { logout } = useAuth()
  const borderColor = useColorModeValue("#e4e5eb", "#2a2a2a")
  const logo = useColorModeValue(LogoDark, LogoLight)

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
        <DrawerContent maxW="250px">
          <DrawerCloseButton />
          <DrawerBody py={8}>
            <Flex flexDir="column" justify="space-between">
              <Box>
                <Image src={logo} alt="Logo" p={6} />
                <SidebarItems onClose={onClose} />
                <Flex
                  as="button"
                  onClick={handleLogout}
                  alignItems="center"
                  gap={4}
                  px={4}
                  py={2}
                >
                  <FaSignOutAlt fontSize="18px" />
                  <Text>Log out</Text>
                </Flex>
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop */}
      <Box
        position="sticky"
        display={{ base: "none", md: "flex" }}
        borderRight={`1px solid ${borderColor}`}
        minW="250px"
        h="100vh"
        top="0"
        p={6}
      >
        <Box justifyContent="center" w="100%">
          <Image src={logo} alt="Logo" p={6} />
          <SidebarItems />
        </Box>
      </Box>
    </>
  )
}

export default Sidebar
