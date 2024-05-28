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

import type { TeamPublic, UserPublic } from "../../client"
import ChangeRole from "../Teams/ChangeRole"
import EditTeam from "../Teams/EditTeam"
import DeleteTeam from "./DeleteTeam"
import RemoveUser from "./RemoveUser"

interface ActionsMenuProps {
  userRole?: string
  team?: TeamPublic
  type: string
  value: UserPublic | TeamPublic
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
  const deleteTeamModal = useDisclosure()
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
            onClick={
              type === "User" ? removeUserModal.onOpen : deleteTeamModal.onOpen
            }
            icon={<FaTrash fontSize="16px" />}
            color="ui.danger"
          >
            {type === "User" ? "Remove" : "Delete"} {type}
          </MenuItem>
        </MenuList>
        {type === "User" ? (
          <ChangeRole
            userRole={userRole}
            teamSlug={team?.slug}
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
        {type === "Team" && (
          <DeleteTeam
            teamSlug={(value as TeamPublic)?.slug}
            isOpen={deleteTeamModal.isOpen}
            onClose={deleteTeamModal.onClose}
          />
        )}
        <RemoveUser
          userId={value.id}
          teamSlug={team?.slug}
          isOpen={removeUserModal.isOpen}
          onClose={removeUserModal.onClose}
        />
      </Menu>
    </>
  )
}

export default ActionsMenu
