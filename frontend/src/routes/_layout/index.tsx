import {
  Navigate,
  createFileRoute,
  useRouterState,
} from "@tanstack/react-router"
import { Suspense } from "react"

import { useCurrentUser } from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: () => (
    <Suspense>
      <Index />
    </Suspense>
  ),
})

function Index() {
  const routerState = useRouterState()
  const currentUser = useCurrentUser()

  return (
    <Navigate
      to="/$team/"
      params={{
        team:
          localStorage.getItem("current_team") ||
          currentUser!.personal_team_slug,
      }}
      search={routerState.location.search}
    />
  )
}
