import { Box, Flex, type IconProps, Text } from "@chakra-ui/react"
import {
  type AnyRoute,
  Link,
  type RegisteredRouter,
  type RoutePaths,
  type ToOptions,
  type UseLinkPropsOptions,
} from "@tanstack/react-router"

import { Apps, Home, Settings } from "@/assets/icons.tsx"
import type { TeamsPublic } from "@/client"
import type { FC } from "react"
import TeamSelector from "./TeamSelector"

// https://github.com/TanStack/router/issues/1194#issuecomment-1956736102
export function link<
  TRouteTree extends AnyRoute = RegisteredRouter["routeTree"],
  TFrom extends RoutePaths<TRouteTree> | string = string,
  TTo extends string = "",
  TMaskFrom extends RoutePaths<TRouteTree> | string = TFrom,
  TMaskTo extends string = "",
>(options: UseLinkPropsOptions<TRouteTree, TFrom, TTo, TMaskFrom, TMaskTo>) {
  return options as UseLinkPropsOptions
}

type Item = {
  icon: FC<IconProps>
  title: string
} & ToOptions

const getSidebarItems = ({ team }: { team: string }): Array<Item> => {
  return [
    {
      icon: Home,
      title: "Dashboard",
      ...link({
        to: "/$team/",
        params: { team },
      }),
    },
    {
      icon: Apps,
      title: "Apps",
      ...link({
        to: "/$team/apps",
        params: { team },
      }),
    },
    {
      icon: Settings,
      title: "Team Settings",
      ...link({
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
          fontSize="sm"
        >
          <IconComponent />
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
