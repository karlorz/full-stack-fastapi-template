import { Suspense } from "react"

import type { TeamWithUserPublic } from "@/client"
import { useCurrentUser } from "@/hooks/useAuth"
import { DataTable } from "../Common/DataTable"
import { PendingTable } from "../PendingComponents/PendingTable"
import { TEAM_COLUMNS } from "./columns"

function TeamContent({ team }: { team: TeamWithUserPublic }) {
  const currentUser = useCurrentUser()

  const teamData = team.user_links.map(({ role, user }) => ({
    isCurrentUser: currentUser?.id === user.id,
    id: user.id,
    email: user.email,
    role,
    team,
  }))

  return <DataTable columns={TEAM_COLUMNS} data={teamData} />
}

function Team({ team }: { team: TeamWithUserPublic }) {
  return (
    <div className="w-full p-0">
      <Suspense fallback={<PendingTable columns={TEAM_COLUMNS} />}>
        <TeamContent team={team} />
      </Suspense>
    </div>
  )
}

export default Team
