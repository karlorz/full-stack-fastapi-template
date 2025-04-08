import { useSuspenseQuery } from "@tanstack/react-query"
import { MailQuestion } from "lucide-react"
import { Suspense } from "react"

import type { TeamPublic } from "@/client"
import { InvitationsService } from "@/client/services"
import { DataTable } from "../Common/DataTable"
import EmptyState from "../Common/EmptyState"
import { PendingTable } from "../PendingComponents/PendingTable"
import { INVITATIONS_COLUMNS } from "./columns"

function InvitationsContent({ team }: { team: TeamPublic }) {
  const { data: invitations } = useSuspenseQuery({
    queryKey: ["invitations"],
    queryFn: () =>
      InvitationsService.readInvitationsTeamByAdmin({
        status: "pending",
        teamId: team.id,
        limit: 100,
      }),
  })

  if (invitations?.data.length === 0) {
    return (
      <div className="flex w-full justify-center">
        <EmptyState
          title="No invitations sent yet"
          description="Send invites to add members to your team and start collaborating."
          icon={MailQuestion}
        />
      </div>
    )
  }

  return <DataTable columns={INVITATIONS_COLUMNS} data={invitations.data} />
}

function Invitations({ team }: { team: TeamPublic }) {
  return (
    <div className="w-full p-0">
      <Suspense fallback={<PendingTable columns={INVITATIONS_COLUMNS} />}>
        <InvitationsContent team={team} />
      </Suspense>
    </div>
  )
}

export default Invitations
