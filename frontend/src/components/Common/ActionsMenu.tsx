import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaExchangeAlt, FaTrash } from "react-icons/fa"

import type { ItemPublic, TeamPublic, UserPublic } from "../../client"
import EditItem from "../Items/EditItem"
import ChangeRole from "../Teams/ChangeRole"
import Remove from "./RemoveAlert"

interface ActionsMenuProps {
  userRole?: string
  teamId?: string
  type: string
  value: ItemPublic | UserPublic | TeamPublic
  disabled?: boolean
}

const ActionsMenu = ({
  userRole,
  teamId,
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
          <MenuItem
            onClick={changeRoleModal.onOpen}
            icon={<FaExchangeAlt fontSize="16px" />}
          >
            Change Role
          </MenuItem>
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
            teamId={teamId}
            user={value as UserPublic}
            isOpen={changeRoleModal.isOpen}
            onClose={changeRoleModal.onClose}
          />
        ) : (
          <EditItem
            item={value as ItemPublic}
            isOpen={editUserModal.isOpen}
            onClose={editUserModal.onClose}
          />
        )}
        <Remove
          teamId={teamId}
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
