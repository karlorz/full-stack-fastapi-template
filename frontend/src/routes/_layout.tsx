import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import posthog from "posthog-js"
import { useEffect } from "react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getTeamsQueryOptions } from "@/queries/teams"
import TeamInvitation from "../components/Invitations/TeamInvitation"
import { AppSidebar } from "../components/Sidebar/AppSidebar"
import Appearance from "../components/UserSettings/Appearance"
import { isLoggedIn, useCurrentUser } from "../hooks/useAuth"

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
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (currentUser) {
      try {
        posthog.identify(currentUser.id, {
          email: currentUser.email,
          name: currentUser.full_name,
        })
      } catch (_error) {
        // do nothing
      }
    }

    posthog.startSessionRecording()
  }, [currentUser])

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

          <footer className="w-full py-4 border-t mt-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <div>
              &copy; {new Date().getFullYear()} FastAPI Labs
              {" | "}
              <a
                href="https://fastapicloud.com/legal/terms"
                target="_blank"
                className="text-primary hover:underline"
                rel="noreferrer"
              >
                Terms of Use
              </a>
              {" | "}
              <a
                href="https://fastapicloud.com/legal/privacy-policy"
                target="_blank"
                className="text-primary hover:underline"
                rel="noreferrer"
              >
                Privacy Policy
              </a>
              {" | "}
              <a
                href="https://fastapicloud.instatus.com/"
                target="_blank"
                className="text-primary hover:underline"
                rel="noreferrer"
              >
                Status
              </a>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>

      <TeamInvitation />
    </>
  )
}
