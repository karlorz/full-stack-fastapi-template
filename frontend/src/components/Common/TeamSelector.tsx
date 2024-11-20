import {
  Box,
  Button,
  Flex,
  type IconProps,
  MenuItemGroup,
  MenuSeparator,
  Text,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"

import { Plus, Users } from "@/assets/icons.tsx"
import type { TeamsPublic } from "@/client"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { getInitials } from "@/utils"
import type { FC } from "react"
import { ArrowDown } from "../../assets/icons"
import TeamIcon from "./TeamIcon"

interface MenuItemLinkProps {
  to: string
  icon?: FC<IconProps>
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
  return (
    <Link to={to}>
      <MenuItem
        closeOnSelect
        value={label || ""}
        gap={2}
        px={4}
        onClick={onClick}
      >
        <TeamIcon bg={bg} icon={icon} initials={initials || ""} />
        <Box width="120px" truncate>
          {label}
        </Box>
      </MenuItem>
    </Link>
  )
}

const TeamSelector = ({
  teams,
  currentTeamSlug,
}: { teams: TeamsPublic; currentTeamSlug: string }) => {
  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const selectedTeam = teams?.data.find((t) => t.slug === currentTeamSlug)
  const otherTeams = teams?.data.filter(
    (t) => !t.is_personal_team && t.name !== selectedTeam?.name,
  )

  return (
    <Flex py={6} justify="center">
      <MenuRoot>
        <MenuTrigger asChild>
          <Button py={6} bg="transparent" data-testid="team-selector">
            <TeamIcon
              bg={selectedTeam?.is_personal_team ? "gradient" : "main.dark"}
              icon={selectedTeam?.is_personal_team ? undefined : Users}
              initials={
                selectedTeam?.is_personal_team
                  ? getInitials(selectedTeam.name)
                  : undefined
              }
            />
            <Box mx={2} textAlign="left">
              <Text width="120px" truncate color="fg.muted">
                {selectedTeam?.name}
              </Text>
              {selectedTeam === personalTeam && (
                <Text fontSize="sm" color="gray.500">
                  Personal Team
                </Text>
              )}
            </Box>
            <ArrowDown color="black" />
          </Button>
        </MenuTrigger>
        <MenuContent p={4} w="100%">
          {selectedTeam !== personalTeam && (
            <>
              <MenuItemGroup title="Personal Team">
                <Text fontWeight="bold" mx={4} my={2} fontSize="xs">
                  Personal Team
                </Text>
                <MenuItemLink
                  to={`/${personalTeam?.slug}/`}
                  label={personalTeam?.name}
                  initials={
                    personalTeam?.name ? getInitials(personalTeam.name) : ""
                  }
                  bg="gradient"
                />
              </MenuItemGroup>
              <MenuSeparator />
            </>
          )}
          {otherTeams && otherTeams.length > 0 && (
            <>
              <MenuItemGroup title="Teams">
                <Flex justifyContent="space-between">
                  <Text fontWeight="bold" mx={4} my={2} fontSize="xs">
                    Teams
                  </Text>
                  {otherTeams?.length > 3 && (
                    <Box textAlign="end" my={2}>
                      <Link to="/teams/all">
                        <Button
                          variant="ghost"
                          color="main.dark"
                          textDecoration="underline"
                        >
                          View all teams
                        </Button>
                      </Link>
                    </Box>
                  )}
                </Flex>
                {otherTeams?.slice(0, 3).map((team) => (
                  <MenuItemLink
                    key={team.id}
                    to={`/${team.slug}/`}
                    icon={Users}
                    label={team.name}
                    bg="main.dark"
                  />
                ))}
              </MenuItemGroup>
              <MenuSeparator m={1} />
            </>
          )}
          <MenuItemLink
            to="/teams/new"
            icon={Plus}
            label="Add new team"
            bg="main.light"
          />
        </MenuContent>
      </MenuRoot>
    </Flex>
  )
}

export default TeamSelector
