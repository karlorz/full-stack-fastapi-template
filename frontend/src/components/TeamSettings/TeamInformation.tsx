import { Container } from "@chakra-ui/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { type TeamUpdate, TeamsService } from "../../client"
import { useCurrentUser } from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
import { Route } from "../../routes/_layout/$team"
import { getCurrentUserRole, handleError } from "../../utils"
import CustomCard from "../Common/CustomCard"
import EditableField from "../Common/EditableField"
import Invitations from "../Invitations/Invitations"
import Team from "../Teams/Team"
import DeleteTeam from "./DeleteTeam"
import TransferTeam from "./TransferTeam"

const TeamInformation = () => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const { team: teamSlug } = Route.useParams()
  const currentUser = useCurrentUser()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => TeamsService.readTeam({ teamSlug: teamSlug }),
  })
  const currentUserRole = getCurrentUserRole(team, currentUser)

  const mutation = useMutation({
    mutationFn: (data: TeamUpdate) =>
      TeamsService.updateTeam({ requestBody: data, teamSlug: teamSlug }),
    onSuccess: () => {
      showToast("Success!", "Team updated successfully", "success")
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  return (
    <Container maxW="full" my={4} p={0}>
      <CustomCard title="Team Name">
        <EditableField
          type="name"
          value={team.name}
          onSubmit={(newName) => mutation.mutate({ name: newName })}
          canEdit={currentUserRole === "admin"}
        />
      </CustomCard>
      <CustomCard title="Team Members" data-testid="team-members">
        <Team />
      </CustomCard>
      {currentUserRole === "admin" && (
        <>
          <CustomCard title="Team Invitations">
            <Invitations />
          </CustomCard>

          <CustomCard title="Transfer Ownership">
            <TransferTeam />
          </CustomCard>

          <CustomCard title="Danger Zone">
            <DeleteTeam />
          </CustomCard>
        </>
      )}
    </Container>
  )
}

export default TeamInformation
