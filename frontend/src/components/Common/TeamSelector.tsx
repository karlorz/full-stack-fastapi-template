import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import type { ElementType } from "react"
import { FaPlus, FaUsers } from "react-icons/fa"

import type { TeamsPublic } from "@/client"
import { Route } from "@/routes/_layout/$team"
import { getInitials } from "@/utils"
import TeamIcon from "./TeamIcon"

interface MenuItemLinkProps {
  to: string
  icon?: ElementType
  initials?: string
  label: string | undefined
  onClick?: () => void
  bg: string
}

const MenuItemLink = ({
  to,
  icon,
  label,
  onClick,
  initials,
  bg,
}: MenuItemLinkProps) => {
  const bgHover = useColorModeValue("#F0F0F0", "#4A5568")
  const bgMenu = useColorModeValue("white", "ui.darkBg")

  return (
    <MenuItem
      as={Link}
      to={to}
      gap={2}
      px={4}
      onClick={onClick}
      bg={bgMenu}
      _hover={{ bg: bgHover, borderRadius: "sm" }}
    >
      <TeamIcon bg={bg} icon={icon} initials={initials || ""} />
      <Box isTruncated maxWidth="150px">
        {label}
      </Box>
    </MenuItem>
  )
}

const TeamSelector = ({ teams }: { teams: TeamsPublic }) => {
  const bg = useColorModeValue("white", "ui.darkBg")
  const color = useColorModeValue("ui.defaultText", "ui.lightText")
  const { team } = Route.useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const currentTeam = teams?.data.find((t) => t.slug === team)
  const personalTeam = teams?.data.find((t) => t.is_personal_team === true)
  const otherTeams = teams?.data.filter(
    (t) => t.is_personal_team === false && t.name !== currentTeam?.name,
  )

  return (
    <>
      <Flex py={6} justify="center">
        <Menu matchWidth={true} isOpen={isOpen} onClose={onClose}>
          <MenuButton
            as={Button}
            py={6}
            w="100%"
            onClick={onOpen}
            data-testid="team-selector"
          >
            <Flex justify="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <TeamIcon
                  bg={currentTeam?.is_personal_team ? "ui.gradient" : "ui.main"}
                  icon={currentTeam?.is_personal_team ? undefined : FaUsers}
                  initials={
                    currentTeam?.is_personal_team
                      ? getInitials(currentTeam.name)
                      : undefined
                  }
                />
                <Box mx={2} textAlign="left">
                  <Text isTruncated maxWidth="150px" color={color}>
                    {currentTeam?.name}
                  </Text>
                  {currentTeam === personalTeam && (
                    <Text fontSize="sm" color="gray.500">
                      Personal Team
                    </Text>
                  )}
                </Box>
              </Box>
              <ChevronDownIcon alignSelf="center" />
            </Flex>
          </MenuButton>
          <MenuList p={4} bg={bg} w="100%">
            {currentTeam !== personalTeam && (
              <>
                <MenuGroup title="Personal Team">
                  <MenuItemLink
                    to={`/${personalTeam?.slug}/`}
                    label={personalTeam?.name}
                    initials={
                      personalTeam?.name ? getInitials(personalTeam.name) : ""
                    }
                    bg="ui.gradient"
                  />
                </MenuGroup>
                <MenuDivider />
              </>
            )}
            {otherTeams && otherTeams.length > 0 && (
              <>
                <MenuGroup>
                  <Flex justifyContent="space-between">
                    <Text fontWeight="bold" mx={4} my={2}>
                      Teams
                    </Text>
                    {otherTeams?.length > 3 && (
                      <Box textAlign="end" my={2}>
                        <Button
                          variant="link"
                          as={Link}
                          to="/teams/all"
                          color="ui.main"
                          textDecoration="underline"
                          onClick={onClose}
                        >
                          View all teams
                        </Button>
                      </Box>
                    )}
                  </Flex>
                  {otherTeams?.slice(0, 3).map((team) => (
                    <MenuItemLink
                      key={team.id}
                      to={`/${team.slug}/`}
                      icon={FaUsers}
                      label={team.name}
                      bg="ui.main"
                    />
                  ))}
                </MenuGroup>
                <MenuDivider />
              </>
            )}
            <MenuItemLink
              to="/teams/new"
              icon={FaPlus}
              label="Add new team"
              bg="#4D99AE"
            />
          </MenuList>
        </Menu>
      </Flex>
    </>
  )
}

export default TeamSelector
