import { createFileRoute } from "@tanstack/react-router"
import TeamInformation from "@/components/TeamSettings/TeamInformation"
import { Section } from "@/components/ui/section"

export const Route = createFileRoute("/_layout/$teamSlug/settings")({
  component: TeamSettings,
})

function TeamSettings() {
  const { teamSlug } = Route.useParams()

  return (
    <Section
      title="Team Settings"
      description="View and manage settings related to your team."
    >
      <TeamInformation teamSlug={teamSlug} />
    </Section>
  )
}
