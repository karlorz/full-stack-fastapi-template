import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useSuspenseQuery } from "@tanstack/react-query"

import { getTeamsQueryOptions } from "@/queries/teams"
import TeamInvitation from "../components/Invitations/TeamInvitation"
import { AppSidebar } from "../components/Sidebar/AppSidebar"
import Appearance from "../components/UserSettings/Appearance"
import { isLoggedIn } from "../hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async ({ location }) => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getTeamsQueryOptions())
  },
})

function Layout() {
  const { data: teams } = useSuspenseQuery(getTeamsQueryOptions())

  return (
    <>
      <SidebarProvider>
        <AppSidebar teams={teams} />
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="md:hidden flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="ml-auto flex items-center pr-4">
              <Appearance />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <TeamInvitation />
    </>
  )
}
