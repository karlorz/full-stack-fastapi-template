import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { type TeamPublic, TeamsService, UsersService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import PendingTeams from "@/components/PendingComponents/PendingTeams"
import { ALL_TEAMS_COLUMNS } from "@/components/Teams/columns"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/teams/all")({
  component: AllTeams,
  pendingComponent: PendingTeams,
})

function AllTeams() {
  const { data: currentUser } = useSuspenseQuery({
    queryKey: ["currentUser"],
    queryFn: () => (isLoggedIn() ? UsersService.readUserMe() : null),
  })

  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams(),
  })

  const teamsData = teams.data.map((team: TeamPublic) => ({
    ...team,
    isOwner: team.owner_id === currentUser?.id,
    isPersonalTeam: team.is_personal_team,
  }))

  return (
    <div className="container p-0">
      <div className="mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">View all your teams.</p>
      </div>

      <DataTable
        dataTestId="teams-table"
        columns={ALL_TEAMS_COLUMNS}
        data={teamsData}
        getRowLink={(team) => `/${team.slug}/`}
      />
    </div>
  )
}
