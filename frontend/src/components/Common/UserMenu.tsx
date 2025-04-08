import { Link } from "@tanstack/react-router"
import { LogOut, Settings } from "lucide-react"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import useAuth, { useCurrentUser } from "@/hooks/useAuth"

const CurrentUserEmail = () => {
  const currentUser = useCurrentUser()
  return currentUser?.email || ""
}

const UserMenu = () => {
  const { logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="w-full px-4"
            data-testid="user-menu"
          >
            My Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-4">
          <p className="px-4 text-sm text-muted-foreground">Logged in as:</p>
          <Suspense fallback={<Skeleton className="h-4 w-[100px] mx-4 my-2" />}>
            <p className="px-4 py-2 text-sm truncate max-w-md">
              <CurrentUserEmail />
            </p>
          </Suspense>

          <DropdownMenuSeparator className="my-1" />
          <Link to="/settings" className="block">
            <DropdownMenuItem className="gap-2 py-2 cursor-pointer">
              <Settings size={16} />
              <span>User Settings</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            className="gap-2 py-2 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserMenu
