import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"

interface UpdateEmailVerificationProps {
  isOpen: boolean
  onClose: () => void
}

const UpdateEmailVerification = ({
  isOpen,
  onClose,
}: UpdateEmailVerificationProps) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Update Verification</ModalHeader>
          <ModalCloseButton />

          <ModalBody data-testid="verification-email-modal">
            <Text>
              Your email update is pending verification. Please check your inbox
              (and spam folder) for a verification link to complete the update
              process.
            </Text>
            <br />
            <Text>
              <strong>
                Your email will not be updated until the verification is
                completed.
              </strong>
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Ok</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateEmailVerification
