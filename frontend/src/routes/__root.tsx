import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"

import type { QueryClient } from "@tanstack/react-query"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import ErrorElement from "../components/Common/ErrorElement"
import NotFound from "../components/Common/NotFound"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => <NotFound />,
  errorComponent: () => <ErrorElement />,
})
