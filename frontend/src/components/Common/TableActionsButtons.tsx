import { Button, Flex, Icon, useDisclosure } from "@chakra-ui/react"
import { FaEdit, FaPlus } from "react-icons/fa"

import AddUser from "../Admin/AddUser"
import AddItem from "../Items/AddItem"

interface NavbarProps {
  type: string
}

const TableActionsButtons = ({ type }: NavbarProps) => {
  const addUserModal = useDisclosure()
  const addItemModal = useDisclosure()

  return (
    <>
      <Flex py={8} gap={4} justify="end">
        <Button
          variant="primary"
          gap={2}
          onClick={type === "User" ? addUserModal.onOpen : addItemModal.onOpen}
        >
          <Icon as={FaPlus} /> Add {type}
        </Button>
        {type === "User" && (
          <>
            <Button variant="primary" gap={2}>
              <Icon as={FaEdit} />
              Edit Organization
            </Button>
          </>
        )}
        <AddUser isOpen={addUserModal.isOpen} onClose={addUserModal.onClose} />
        <AddItem isOpen={addItemModal.isOpen} onClose={addItemModal.onClose} />
      </Flex>
    </>
  )
}

export default TableActionsButtons
