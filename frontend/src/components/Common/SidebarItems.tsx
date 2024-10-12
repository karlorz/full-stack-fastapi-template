import {
  Box,
  Flex,
  type FlexProps,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import {
  type AnyRoute,
  Link,
  type LinkProps,
  type RegisteredRouter,
  type RoutePaths,
  type ToOptions,
  type UseLinkPropsOptions,
} from "@tanstack/react-router"

import { Apps, Home, Settings } from "@/assets/icons.tsx"
import type { TeamsPublic } from "@/client"
import type { ElementType } from "react"
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
  icon: ElementType
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

// Looks like `as` doesn't do full type inference, so we created a new component
// with the correct types for the props we want to pass to the `Link` component.
// see this issue: https://github.com/chakra-ui/chakra-ui/issues/1582
const FlexLink = (props: LinkProps & Omit<FlexProps, "as">) => (
  <Flex as={Link} {...props} />
)

const SidebarItems = ({
  onClose,
  teams,
  currentTeamSlug,
}: SidebarItemsProps) => {
  const bgHover = useColorModeValue("#F9F9FA", "#5A6578")
  const bgActive = useColorModeValue("#F3F3F3", "#4A5568")

  const items = getSidebarItems({ team: currentTeamSlug })

  const listItems = items.map(({ icon, title, to, params }) => (
    <FlexLink
      key={title}
      to={to}
      params={params}
      gap={4}
      px={4}
      py={2}
      _hover={{
        background: bgHover,
        color: "#338A96",
        borderRadius: "sm",
        boxShadow: "inset 5px 0 0 0 #338A96",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
      activeProps={{
        style: {
          background: bgActive,
          color: "#00667A",
          borderRadius: "sm",
          boxShadow: "inset 5px 0 0 0 #00667A",
        },
      }}
      onClick={onClose}
      alignItems="center"
    >
      <Icon as={icon} boxSize={4} />
      {title}
    </FlexLink>
  ))

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
