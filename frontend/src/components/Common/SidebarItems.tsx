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
import { CgOrganisation } from "react-icons/cg"
import {
  FaCog,
  FaHome,
  FaLayerGroup,
  FaQuestionCircle,
  FaTools,
} from "react-icons/fa"

import { useCurrentUser } from "../../hooks/useAuth"
import { Route } from "../../routes/_layout/$team"

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
  icon: React.ElementType
  title: string
} & ToOptions

const getSidebarItems = ({ team }: { team: string }): Array<Item> => {
  return [
    {
      icon: FaHome,
      title: "Dashboard",
      ...link({
        to: "/$team/",
        params: { team },
      }),
    },
    {
      icon: FaLayerGroup,
      title: "Apps",
      ...link({
        to: "/$team/apps",
        params: { team },
      }),
    },
    {
      icon: FaTools,
      title: "Resources",
      ...link({
        to: "/$team/resources",
        params: { team },
      }),
    },
    {
      icon: FaCog,
      title: "Team Settings",
      ...link({
        to: "/$team/settings",
        params: { team },
      }),
    },
    {
      icon: CgOrganisation,
      title: "Teams",
      ...link({
        to: "/teams/all",
      }),
    },
    {
      icon: FaQuestionCircle,
      title: "Help",
      ...link({
        to: "/$team/help",
        params: { team },
      }),
    },
  ]
}

interface SidebarItemsProps {
  onClose?: () => void
}

// Looks like `as` doesn't do full type inference, so we created a new component
// with the correct types for the props we want to pass to the `Link` component.
// see this issue: https://github.com/chakra-ui/chakra-ui/issues/1582
const FlexLink = (props: LinkProps & Omit<FlexProps, "as">) => (
  <Flex as={Link} {...props} />
)

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const { team } = Route.useParams()
  const user = useCurrentUser()
  const bgHover = useColorModeValue("#F0F0F0", "#4A5568")

  const items = getSidebarItems({ team: team || user!.personal_team_slug })

  const listItems = items.map(({ icon, title, to, params }) => (
    <FlexLink
      key={title}
      to={to}
      params={params}
      gap={4}
      px={4}
      py={2}
      fontSize="md"
      _hover={{
        background: bgHover,
        borderRadius: "12px",
      }}
      activeProps={{
        style: {
          color: "#009688",
        },
      }}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" fontSize="18px" />
      <Text>{title}</Text>
    </FlexLink>
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
