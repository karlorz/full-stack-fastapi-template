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
import {
  FaCog,
  FaCubes,
  FaHome,
  FaQuestionCircle,
  FaTools,
  FaUsers,
} from "react-icons/fa"

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

const items: Array<Item> = [
  { icon: FaHome, title: "Dashboard", to: "/" },
  {
    icon: FaCubes,
    title: "Projects",
    ...link({
      to: "/$team/projects",
      params: { team: "a-team" },
    }),
  },
  {
    icon: FaTools,
    title: "Resources",
    ...link({
      to: "/$team/resources",
      params: { team: "a-team" },
    }),
  },
  // TODO: this should probably be members or users
  {
    icon: FaUsers,
    title: "Team",
    ...link({
      to: "/teams/$teamId",
      params: { teamId: "1" },
    }),
  },
  {
    icon: FaCog,
    title: "Settings",
    ...link({
      to: "/$team/settings",
      params: { team: "a-team" },
    }),
  },
  {
    icon: FaQuestionCircle,
    title: "Help",
    ...link({
      to: "/$team/help",
      params: { team: "a-team" },
    }),
  },
]

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
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")

  const listItems = items.map(({ icon, title, to, params }) => (
    <FlexLink
      key={title}
      to={to}
      params={params}
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
