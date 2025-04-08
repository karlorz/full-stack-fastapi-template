import TeamInformation from "@/components/TeamSettings/TeamInformation"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/$teamSlug/settings")({
  component: TeamSettings,
})

function TeamSettings() {
  const { teamSlug } = Route.useParams()

  return (
    <div className="w-full p-0">
      <h1 className="text-2xl font-extrabold tracking-tight">Team Settings</h1>
      <p className="text-sm text-muted-foreground">
        View and manage settings related to your team.
      </p>
      <TeamInformation teamSlug={teamSlug} />
    </div>
  )
}
