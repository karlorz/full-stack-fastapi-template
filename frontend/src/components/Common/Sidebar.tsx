import {
  Box,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { FaBars, FaSignOutAlt } from "react-icons/fa"

import Logo from "../../assets/images/fastapi-logo.svg"
import useAuth from "../../hooks/useAuth"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { logout } = useAuth()

  const handleLogout = async () => {
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
                <Image src={Logo} alt="logo" p={6} />
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
        boxShadow="md"
        minW="250px"
        h="100vh"
        top="0"
        p={6}
      >
        <Box justifyContent="center" w="100%">
          <Center>
            <Image src={Logo} alt="Logo" maxW="140px" py={6} />
          </Center>
          <SidebarItems />
        </Box>
      </Box>
    </>
  )
}

export default Sidebar
