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
        <Heading size="sm" pt={6}>
          Delete Team
        </Heading>
        <Text py={2}>
          Permanently delete your data and everything associated with your team.
        </Text>
        <Button variant="danger" mt={4} onClick={confirmationModal.onOpen}>
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
