import { createFileRoute } from "@tanstack/react-router"

import UserInformation from "@/components/UserSettings/UserInformation"
import { Section } from "@/components/ui/section"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  return (
    <Section
      title="User Settings"
      description="View and manage settings related to your account."
    >
      <UserInformation />
    </Section>
  )
}
