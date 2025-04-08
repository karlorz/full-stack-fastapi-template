import { useSuspenseQuery } from "@tanstack/react-query"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { TeamsService } from "@/client"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import TeamInvitation from "../components/Invitations/TeamInvitation"
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
    await context.queryClient.ensureQueryData({
      queryFn: () => TeamsService.readTeams({}),
      queryKey: ["teams"],
    })
  },
})

function Layout() {
  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-40 h-full w-[280px] border-r">
        <Suspense>
          <Sidebar teams={teams} />
        </Suspense>
      </div>

      <div className={cn("flex min-h-screen flex-col", "md:pl-[280px]")}>
        {/* Navbar */}
        <header className="sticky top-0 z-50 hidden h-16 items-center justify-end bg-background border-b px-6 md:flex">
          <div className="flex items-center gap-2">
            <Appearance />
            <UserMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>

      <TeamInvitation />
    </div>
  )
}
