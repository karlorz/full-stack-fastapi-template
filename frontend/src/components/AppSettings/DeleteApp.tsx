import {
  Box,
  Button,
  Circle,
  Container,
  Flex,
  Heading,
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
        <Flex
          align="center"
          justify="space-between"
          flexDir={{ base: "column", md: "row" }}
        >
          <Flex
            align={{ base: "start", md: "center" }}
            gap={4}
            flexDir={{ base: "column", md: "row" }}
          >
            <Circle size="40px" bg="ui.danger" color="white">
              <WarningTwoIcon boxSize="18px" />
            </Circle>
            <Box>
              <Heading size="sm" fontWeight="bold" mb={2}>
                Danger Zone
              </Heading>
              <Text>Permanently delete your app and all its data.</Text>
            </Box>
          </Flex>
          <Button
            variant="danger"
            onClick={confirmationModal.onOpen}
            display={{ base: "block", md: "inline-block" }}
            mt={{ base: 4, md: 0 }}
            alignSelf={{ base: "flex-start", md: "auto" }}
          >
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
