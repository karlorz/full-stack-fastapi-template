import { createFileRoute } from "@tanstack/react-router"

import UserInformation from "@/components/UserSettings/UserInformation"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  return (
    <div className="w-full p-0">
      <h1 className="text-2xl font-extrabold tracking-tight">User Settings</h1>
      <p className="text-muted-foreground">
        View and manage settings related to your account.
      </p>
      <UserInformation />
    </div>
  )
}
