import {
  Box,
  Button,
  Circle,
  Container,
  Flex,
  Text,
  useDisclosure,
} from "@chakra-ui/react"

import { WarningTwoIcon } from "@chakra-ui/icons"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteApp = ({ appSlug, appId }: { appSlug: string; appId: string }) => {
  const confirmationModal = useDisclosure()

  return (
    <>
      <Container maxW="full" p={0}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={4}>
            <Circle size="40px" bg="ui.danger" color="white">
              <WarningTwoIcon boxSize="18px" />
            </Circle>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Danger Zone
              </Text>
              <Text>Permanently delete your app and all its data.</Text>
            </Box>
          </Flex>
          <Button variant="danger" onClick={confirmationModal.onOpen}>
            Delete App
          </Button>
        </Flex>
        <DeleteConfirmation
          appId={appId}
          appSlug={appSlug}
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.onClose}
        />
      </Container>
    </>
  )
}
export default DeleteApp
