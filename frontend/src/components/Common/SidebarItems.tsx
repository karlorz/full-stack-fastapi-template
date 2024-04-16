import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import {
  FaCog,
  FaCreditCard,
  FaCubes,
  FaHome,
  FaQuestionCircle,
  FaTools,
  FaUsers,
} from "react-icons/fa"

const items = [
  { icon: FaHome, title: "Dashboard", path: "/" },
  { icon: FaCubes, title: "Projects", path: "/projects" },
  { icon: FaTools, title: "Resources", path: "/items" },
  { icon: FaUsers, title: "Organization", path: "/organization/1" },
  { icon: FaCog, title: "Settings", path: "/settings" },
  { icon: FaCreditCard, title: "Billing", path: "/billing" },
  { icon: FaQuestionCircle, title: "Help", path: "/help" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")

  const listItems = items.map(({ icon, title, path }) => (
    <Flex
      key={title}
      to={path}
      as={Link}
      gap={4}
      px={4}
      py={2}
      fontSize="md"
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" fontSize="18px" />
      <Text>{title}</Text>
    </Flex>
  ))

  const menu = listItems.slice(0, 4)
  const others = listItems.slice(4)

  return (
    <>
      <Text
        fontSize="xs"
        px={4}
        py={2}
        textTransform="uppercase"
        fontWeight="bold"
      >
        Menu
      </Text>
      <Box>{menu}</Box>
      <Text
        fontSize="xs"
        px={4}
        py={2}
        textTransform="uppercase"
        fontWeight="bold"
      >
        Others
      </Text>
      <Box>{others}</Box>
    </>
  )
}

export default SidebarItems
