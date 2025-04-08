import { Link, useRouterState } from "@tanstack/react-router"
import { LogOut, Menu, User } from "lucide-react"
import { Suspense, useEffect } from "react"

import type { TeamsPublic } from "@/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import useAuth, { useCurrentUser } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import SidebarItems from "./SidebarItems"

const Sidebar = ({ teams }: { teams: TeamsPublic }) => {
  const matches = useRouterState({ select: (s) => s.matches })
  const lastMatch = matches[matches.length - 1]
  const team = lastMatch?.params.teamSlug
  const { logout } = useAuth()

  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const currentTeamSlug =
    team || localStorage.getItem("current_team") || personalTeam?.slug || ""

  useEffect(() => {
    if (currentTeamSlug) {
      localStorage.setItem("current_team", currentTeamSlug)
    }
  }, [currentTeamSlug])

  const CurrentUserEmail = () => {
    const currentUser = useCurrentUser()
    return currentUser?.email || ""
  }

  return (
    <>
      {/* Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed m-1">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <SidebarItems teams={teams} currentTeamSlug={currentTeamSlug} />
            </div>
            <div className="px-4 py-2">
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">Logged in as:</p>
              <Suspense fallback={<Skeleton className="h-4 w-[100px]" />}>
                <p className="truncate py-2">
                  <CurrentUserEmail />
                </p>
              </Suspense>
              <Link
                to="/settings"
                className="flex items-center gap-4 px-4 py-2 text-sm hover:bg-accent rounded-md"
              >
                <User className="h-4 w-4" />
                User Settings
              </Link>
              <Button
                onClick={() => logout()}
                className="flex w-full items-center gap-4 px-4 py-2 text-sm hover:bg-accent rounded-md"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <div
        className={cn(
          "hidden md:flex bg-background border-r",
          "h-[calc(100vh-64px)] w-[280px] mt-16 p-6",
        )}
      >
        <div className="w-full">
          <SidebarItems teams={teams} currentTeamSlug={currentTeamSlug} />
        </div>
      </div>
    </>
  )
}

export default Sidebar
