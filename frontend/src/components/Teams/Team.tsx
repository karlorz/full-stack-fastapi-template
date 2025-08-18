import { Suspense } from "react"

import type { Role, TeamWithUserPublic } from "@/client"
import { useCurrentUser } from "@/hooks/useAuth"
import { DataTable } from "../Common/DataTable"
import { PendingTable } from "../PendingComponents/PendingTable"
import { getTeamColumns } from "./columns"

function TeamContent({
  team,
  currentUserRole,
}: {
  team: TeamWithUserPublic
  currentUserRole?: Role
}) {
  const currentUser = useCurrentUser()
  const columns = getTeamColumns(currentUserRole)

  const teamData = team.user_links.map(({ role, user }) => ({
    isCurrentUser: currentUser?.id === user.id,
    id: user.id,
    email: user.email,
    role,
    team,
  }))

  return <DataTable columns={columns} data={teamData} />
}

function Team({
  team,
  currentUserRole,
}: {
  team: TeamWithUserPublic
  currentUserRole?: Role
}) {
  const columns = getTeamColumns(currentUserRole)
  return (
    <div className="w-full">
      <Suspense fallback={<PendingTable columns={columns} />}>
        <TeamContent team={team} currentUserRole={currentUserRole} />
      </Suspense>
    </div>
  )
}

export default Team
