import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"

import type { TeamPublic, UserPublic } from "@/client"
import { MenuContent, MenuRoot, MenuTrigger } from "@/components/ui/menu"
import ChangeRole from "../Teams/ChangeRole"
import RemoveUser from "./RemoveUser"

interface ActionsMenuProps {
  userRole?: string
  team?: TeamPublic
  value: UserPublic | TeamPublic
}

const ActionsMenu = ({ userRole, team, value }: ActionsMenuProps) => {
  return (
    <>
      <MenuRoot>
        <MenuTrigger asChild>
          <IconButton variant="ghost" color="inherit">
            <BsThreeDotsVertical />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <ChangeRole
            userRole={userRole}
            teamId={team?.id}
            user={value as UserPublic}
          />

          <RemoveUser userId={value.id} teamId={team?.id} />
        </MenuContent>
      </MenuRoot>
    </>
  )
}

export default ActionsMenu
