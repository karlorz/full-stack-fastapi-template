import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaEdit, FaExchangeAlt, FaTrash } from "react-icons/fa"

import type { ItemPublic, TeamPublic, UserPublic } from "../../client"
import ChangeRole from "../Teams/ChangeRole"
import EditTeam from "../Teams/EditTeam"
import Remove from "./RemoveAlert"

interface ActionsMenuProps {
  userRole?: string
  team?: TeamPublic
  type: string
  value: ItemPublic | UserPublic | TeamPublic
  disabled?: boolean
}

const ActionsMenu = ({
  userRole,
  team,
  type,
  value,
  disabled,
}: ActionsMenuProps) => {
  const changeRoleModal = useDisclosure()
  const editUserModal = useDisclosure()
  const deleteModal = useDisclosure()

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
          {type === "User" ? (
            <MenuItem
              onClick={changeRoleModal.onOpen}
              icon={<FaExchangeAlt fontSize="16px" />}
            >
              Change Role
            </MenuItem>
          ) : (
            <MenuItem
              onClick={editUserModal.onOpen}
              icon={<FaEdit fontSize="16px" />}
            >
              Edit {type}
            </MenuItem>
          )}
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FaTrash fontSize="16px" />}
            color="ui.danger"
          >
            Remove {type}
          </MenuItem>
        </MenuList>
        {type === "User" ? (
          <ChangeRole
            userRole={userRole}
            teamId={team?.id}
            user={value as UserPublic}
            isOpen={changeRoleModal.isOpen}
            onClose={changeRoleModal.onClose}
          />
        ) : (
          <EditTeam
            team={value as TeamPublic}
            isOpen={editUserModal.isOpen}
            onClose={editUserModal.onClose}
          />
        )}
        <Remove
          teamId={team?.id}
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  )
}

export default ActionsMenu
