import { Button, Text } from "@chakra-ui/react"

import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const UpdateEmailInfo = () => {
  return (
    <>
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>Email Update Verification</DialogTitle>
        </DialogHeader>
        <DialogBody data-testid="verification-email-modal">
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
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger>
            <Button variant="solid">Ok</Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </>
  )
}

export default UpdateEmailInfo
