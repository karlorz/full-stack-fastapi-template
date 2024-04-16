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

import type { ItemPublic, OrganizationPublic, UserPublic } from "../../client"
import EditItem from "../Items/EditItem"
import ChangeRole from "../Organization/ChangeRole"
import Remove from "./RemoveAlert"

interface ActionsMenuProps {
  userRole?: string
  orgId?: string
  type: string
  value: ItemPublic | UserPublic | OrganizationPublic
  disabled?: boolean
}

const ActionsMenu = ({
  userRole,
  orgId,
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
            orgId={orgId}
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
          orgId={orgId}
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
