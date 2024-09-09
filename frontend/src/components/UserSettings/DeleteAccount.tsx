import { Button, Container, Text, useDisclosure } from "@chakra-ui/react"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  const confirmationModal = useDisclosure()

  return (
    <>
      <Container maxW="full" p={0}>
        <Text py={2} mb={2}>
          Permanently delete your data and everything associated with your
          account.
        </Text>
        <Button variant="danger" onClick={confirmationModal.onOpen}>
          Delete
        </Button>
        <DeleteConfirmation
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.onClose}
        />
      </Container>
    </>
  )
}
export default DeleteAccount
