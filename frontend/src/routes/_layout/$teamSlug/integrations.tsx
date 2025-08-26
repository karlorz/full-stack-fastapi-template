import { createFileRoute, notFound } from "@tanstack/react-router"
import { IntegrationsView } from "@/components/AppSettings/Integrations"
import { CustomCard } from "@/components/ui/custom-card"
import { Section } from "@/components/ui/section"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute("/_layout/$teamSlug/integrations")({
  component: IntegrationsPage,
  loader: async ({ context, params: { teamSlug } }) => {
    try {
      const team = await context.queryClient.ensureQueryData(
        getTeamQueryOptions(teamSlug),
      )
      return { team }
    } catch {
      throw notFound({ routeId: "__root__" })
    }
  },
  head: (ctx) => ({
    meta: [
      {
        title: `Integrations - ${ctx.loaderData?.team.name} - FastAPI Cloud`,
      },
    ],
  }),
})

function IntegrationsPage() {
  return (
    <Section
      title="Integrations"
      description="Connect external services to your applications."
    >
      <CustomCard
        title="Third-Party Integrations"
        description="Connect external services to your applications."
      >
        <IntegrationsView />
      </CustomCard>
    </Section>
  )
}
