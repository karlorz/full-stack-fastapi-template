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

const DeleteTeam = ({ teamId }: { teamId: string }) => {
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
            <Circle size="40px" bg="error.base" color="white">
              <WarningTwoIcon boxSize="18px" />
            </Circle>
            <Box>
              <Heading size="sm" fontWeight="bold" mb={2}>
                Danger Zone
              </Heading>
              <Text>
                Permanently delete your data and everything associated with your
                team.
              </Text>
            </Box>
          </Flex>
          <Button
            variant="danger"
            onClick={confirmationModal.onOpen}
            display={{ base: "block", md: "inline-block" }}
            mt={{ base: 4, md: 0 }}
            alignSelf={{ base: "flex-start", md: "auto" }}
          >
            Delete Team
          </Button>
        </Flex>
        <DeleteConfirmation
          teamId={teamId}
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.onClose}
        />
      </Container>
    </>
  )
}
export default DeleteTeam
