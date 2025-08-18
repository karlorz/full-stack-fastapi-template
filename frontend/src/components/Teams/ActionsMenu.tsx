import { MoreVertical } from "lucide-react"
import { useState } from "react"
import type { Role, TeamPublic, UserPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ChangeRole from "./ChangeRole"
import type { TeamMember } from "./columns"
import RemoveUser from "./RemoveUser"

interface ActionsMenuProps {
  userRole: Role
  team: TeamPublic
  value: UserPublic | TeamMember
}

const ActionsMenu = ({ userRole, team, value }: ActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ChangeRole
          userRole={userRole}
          teamId={team?.id}
          user={value as UserPublic}
          onActionComplete={() => setOpen(false)}
        />
        <RemoveUser
          userId={value.id}
          teamId={team?.id}
          onActionComplete={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ActionsMenu
