import {
  Navigate,
  createFileRoute,
  useRouterState,
} from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/")({
  component: Index,
})

function Index() {
  const routerState = useRouterState()
  return (
    <Navigate
      to="/$team"
      params={{ team: "a-team" }}
      search={routerState.location.search}
    />
  )
}
