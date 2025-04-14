import type { TeamPublic, UserPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import ChangeRole from "../Teams/ChangeRole"
import RemoveUser from "../Teams/RemoveUser"
import type { TeamMember } from "../Teams/columns"

interface ActionsMenuProps {
  userRole?: string
  team?: TeamPublic
  value: UserPublic | TeamPublic | TeamMember
}

const ActionsMenu = ({ userRole, team, value }: ActionsMenuProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ChangeRole
          userRole={userRole}
          teamId={team?.id}
          user={value as UserPublic}
        />
        <RemoveUser userId={value.id} teamId={team?.id} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ActionsMenu
