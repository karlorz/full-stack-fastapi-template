import { createFileRoute } from "@tanstack/react-router"
import TeamInformation from "@/components/TeamSettings/TeamInformation"
import { Section } from "@/components/ui/section"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute("/_layout/$teamSlug/settings")({
  component: TeamSettings,
  loader: async ({ context, params: { teamSlug } }) => {
    const team = await context.queryClient.ensureQueryData(
      getTeamQueryOptions(teamSlug),
    )
    return { team }
  },
  head: (ctx) => ({
    meta: [
      {
        title: `Team Settings - ${ctx.loaderData?.team.name} - FastAPI Cloud`,
      },
    ],
  }),
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
