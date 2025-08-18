import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"
import posthog from "posthog-js"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
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
      <div className="relative min-h-screen flex flex-col">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
        <SidebarProvider>
          <AppSidebar teams={teams} />
          <SidebarInset>
            <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2">
              <div className="md:hidden flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
              </div>
              <div className="ml-auto flex items-center pr-4 gap-4">
                <a
                  href="https://fastapicloud.com/docs/getting-started"
                  target="_blank"
                  rel="noopener"
                >
                  <Button
                    className="flex gap-4 text-sm hover:underline"
                    variant="outline"
                  >
                    <span>Docs</span>
                    <ExternalLink className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </a>
                <Appearance />
              </div>
            </header>
            <main className="flex-1 px-2 mx-auto w-full sm:px-8 lg:px-16 2xl:px-32 py-6">
              <Outlet />
            </main>

            <footer className="w-full text-center text-sm text-zinc-500 dark:text-zinc-400 font-body tracking-wide select-none py-6 mt-8">
              © {new Date().getFullYear()} FastAPI Labs, Inc &middot;{" "}
              <a
                href="https://fastapicloud.com/legal/terms"
                target="_blank"
                className="hover:underline"
                rel="noopener"
              >
                Terms of Use
              </a>{" "}
              &middot;{" "}
              <a
                href="https://fastapicloud.com/legal/privacy-policy"
                target="_blank"
                className="hover:underline"
                rel="noopener"
              >
                Privacy Policy
              </a>{" "}
              &middot;{" "}
              <a
                href="https://fastapicloud.instatus.com/"
                target="_blank"
                className="hover:underline"
                rel="noopener"
              >
                Status
              </a>
            </footer>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <TeamInvitation />
    </>
  )
}
