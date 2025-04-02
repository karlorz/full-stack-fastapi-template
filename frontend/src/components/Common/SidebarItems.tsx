import { Box, Flex, Text } from "@chakra-ui/react"
import { Link, type ToOptions, linkOptions } from "@tanstack/react-router"

import type { TeamsPublic } from "@/client"
import { Home, LayoutGrid, type LucideIcon, Settings } from "lucide-react"
import TeamSelector from "./TeamSelector"

type Item = {
  icon: LucideIcon
  title: string
} & ToOptions

const getSidebarItems = ({ team }: { team: string }): Array<Item> => {
  return [
    {
      icon: Home,
      title: "Dashboard",
      ...linkOptions({
        to: "/$team/",
        params: { team },
      }),
    },
    {
      icon: LayoutGrid,
      title: "Apps",
      ...linkOptions({
        to: "/$team/apps",
        params: { team },
      }),
    },
    {
      icon: Settings,
      title: "Team Settings",
      ...linkOptions({
        to: "/$team/settings",
        params: { team },
      }),
    },
  ]
}

interface SidebarItemsProps {
  onClose?: () => void
  teams: TeamsPublic
  currentTeamSlug: string
}

const SidebarItems = ({
  onClose,
  teams,
  currentTeamSlug,
}: SidebarItemsProps) => {
  const items = getSidebarItems({ team: currentTeamSlug })

  const listItems = items.map(
    ({ icon: IconComponent, title, to, params }, index) => (
      <Link to={to} params={params} onClick={onClose} key={index}>
        <Flex
          gap={4}
          px={4}
          py={2}
          _hover={{
            background: "gray.subtle",
          }}
          alignItems="center"
        >
          <IconComponent size={18} />
          {title}
        </Flex>
      </Link>
    ),
  )
  return (
    <>
      <TeamSelector teams={teams} currentTeamSlug={currentTeamSlug} />
      <Text fontSize="xs" px={4} py={2} fontWeight="bold">
        Menu
      </Text>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
