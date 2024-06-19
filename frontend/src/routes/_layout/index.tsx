import {
  Navigate,
  createFileRoute,
  useRouterState,
} from "@tanstack/react-router"
import { useCurrentUser } from "../../hooks/useAuth"
import { Suspense } from "react"

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
      to="/$team"
      params={{ team: currentUser!.personal_team_slug }}
      search={routerState.location.search}
    />
  )
}
