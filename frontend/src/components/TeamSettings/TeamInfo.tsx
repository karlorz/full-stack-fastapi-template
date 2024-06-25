import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"

import { TeamsService } from "../../client"
import { useCurrentUser } from "../../hooks/useAuth"
import { Route } from "../../routes/_layout/$team"
import { getCurrentUserRole } from "../../utils"
import Invitations from "../Invitations/Invitations"
import NewInvitation from "../Invitations/NewInvitation"
import Team from "../Teams/Team"
import TeamName from "../Teams/TeamName"
import DeleteTeam from "./DeleteTeam"

const TeamInfo = () => {
  const { team: teamSlug } = Route.useParams()
  const currentUser = useCurrentUser()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => TeamsService.readTeam({ teamSlug: teamSlug }),
  })
  const currentUserRole = getCurrentUserRole(team, currentUser)

  return (
    <Container maxW="full" m={4}>
      <Heading size="sm">Team Information</Heading>
      <Text py={2} mb={4}>
        See information regarding your team.
      </Text>
      <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
        <Box my={4}>
          <Text fontWeight="bold" mb={4}>
            Team Name
          </Text>

          <Flex>
            <TeamName />
          </Flex>
        </Box>
      </Box>
      <Box>
        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Text fontWeight="bold" mb={4}>
            Team Members
          </Text>
          <Team />
        </Box>
      </Box>
      {currentUserRole === "admin" && (
        <>
          <Flex gap="8">
            <Box width="70%">
              <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
                <Text fontWeight="bold" mb={4}>
                  Team Invitations
                </Text>
                <Flex>
                  <Invitations />
                </Flex>
              </Box>
            </Box>

            <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
              <Text fontWeight="bold" mb={4}>
                New Invitation
              </Text>
              <Flex>
                <NewInvitation />
              </Flex>
            </Box>
          </Flex>

          <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
            <Text fontWeight="bold" mb={4}>
              Danger Zone
            </Text>
            <Flex>
              <DeleteTeam />
            </Flex>
          </Box>
        </>
      )}
    </Container>
  )
}

export default TeamInfo
