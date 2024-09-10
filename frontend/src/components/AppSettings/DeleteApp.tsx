import { Button, Container, Text, useDisclosure } from "@chakra-ui/react"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteApp = ({ appSlug }: { appSlug: string }) => {
  const confirmationModal = useDisclosure()

  return (
    <>
      <Container maxW="full">
        <Text py={2} mb={2}>
          Permanently delete your app and all its data.
        </Text>
        <Button variant="danger" onClick={confirmationModal.onOpen}>
          Delete App
        </Button>
        <DeleteConfirmation
          appSlug={appSlug}
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.onClose}
        />
      </Container>
    </>
  )
}
export default DeleteApp
