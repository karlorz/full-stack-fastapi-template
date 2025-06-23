import { createFileRoute, Navigate } from "@tanstack/react-router"
import { Suspense } from "react"

import { useCurrentUser } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: () => (
    <Suspense>
      <Index />
    </Suspense>
  ),
})

function Index() {
  const search = Route.useSearch()
  const currentUser = useCurrentUser()

  return (
    <Navigate
      to="/$teamSlug/"
      params={{
        teamSlug:
          localStorage.getItem("current_team") ||
          currentUser!.personal_team_slug,
      }}
      search={search}
    />
  )
}
