import {
  Button,
  Container,
  Heading,
  Text,
  useDisclosure,
} from "@chakra-ui/react"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteTeam = () => {
  const confirmationModal = useDisclosure()

  return (
    <>
      <Container maxW="full" m={4}>
        <Heading size="sm">Delete Team</Heading>
        <Text py={2} mb={2}>
          Permanently delete your data and everything associated with your team.
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
export default DeleteTeam
