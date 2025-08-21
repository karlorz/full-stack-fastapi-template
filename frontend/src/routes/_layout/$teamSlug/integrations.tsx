import { createFileRoute } from "@tanstack/react-router"
import { IntegrationsView } from "@/components/AppSettings/Integrations"
import { CustomCard } from "@/components/ui/custom-card"
import { Section } from "@/components/ui/section"

export const Route = createFileRoute("/_layout/$teamSlug/integrations")({
  component: IntegrationsPage,
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
