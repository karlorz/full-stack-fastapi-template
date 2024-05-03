import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react"
import React from "react"

interface DeleteProps {
  isOpen: boolean
  onClose: () => void
}

const DeleteConfirmation = ({ isOpen, onClose }: DeleteProps) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent as="form">
            <AlertDialogHeader>Confirmation Required</AlertDialogHeader>

            <AlertDialogBody>
              All your account data will be{" "}
              <strong>permanently deleted.</strong> If you are sure, please
              click <strong>"Confirm"</strong> to proceed. This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default DeleteConfirmation
