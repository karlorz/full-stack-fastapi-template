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
import { FaPlus } from "react-icons/fa"

import { Users } from "@/assets/icons.tsx"
import type { TeamsPublic } from "@/client"
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

const TeamSelector = ({
  teams,
  currentTeamSlug,
}: { teams: TeamsPublic; currentTeamSlug: string }) => {
  const bg = useColorModeValue("white", "ui.darkBg")
  const color = useColorModeValue("ui.defaultText", "ui.lightText")
  const { isOpen, onOpen, onClose } = useDisclosure()

  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const selectedTeam = teams?.data.find((t) => t.slug === currentTeamSlug)
  const otherTeams = teams?.data.filter(
    (t) => !t.is_personal_team && t.name !== selectedTeam?.name,
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
                  bg={
                    selectedTeam?.is_personal_team ? "ui.gradient" : "ui.main"
                  }
                  icon={selectedTeam?.is_personal_team ? undefined : Users}
                  initials={
                    selectedTeam?.is_personal_team
                      ? getInitials(selectedTeam.name)
                      : undefined
                  }
                />
                <Box mx={2} textAlign="left">
                  <Text isTruncated maxWidth="150px" color={color}>
                    {selectedTeam?.name}
                  </Text>
                  {selectedTeam === personalTeam && (
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
            {selectedTeam !== personalTeam && (
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
                      icon={Users}
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
