import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaExchangeAlt } from "react-icons/fa"

import { Trash } from "@/assets/icons.tsx"
import type { TeamPublic, UserPublic } from "@/client"
import ChangeRole from "../Teams/ChangeRole"
import RemoveUser from "./RemoveUser"

interface ActionsMenuProps {
  userRole?: string
  team?: TeamPublic
  value: UserPublic | TeamPublic
  disabled?: boolean
}

const ActionsMenu = ({ userRole, team, value, disabled }: ActionsMenuProps) => {
  const changeRoleModal = useDisclosure()
  const removeUserModal = useDisclosure()

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem
            onClick={changeRoleModal.onOpen}
            icon={<FaExchangeAlt fontSize="16px" />}
          >
            Change Role
          </MenuItem>
          <MenuItem
            onClick={removeUserModal.onOpen}
            icon={<Trash fontSize="16px" />}
            color="error.base"
          >
            Remove User
          </MenuItem>
        </MenuList>
        <ChangeRole
          userRole={userRole}
          teamId={team?.id}
          user={value as UserPublic}
          isOpen={changeRoleModal.isOpen}
          onClose={changeRoleModal.onClose}
        />
        <RemoveUser
          userId={value.id}
          teamId={team?.id}
          isOpen={removeUserModal.isOpen}
          onClose={removeUserModal.onClose}
        />
      </Menu>
    </>
  )
}

export default ActionsMenu
