import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const UpdateEmailInfo = () => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Email Update Verification</DialogTitle>
      </DialogHeader>

      <div className="space-y-4" data-testid="verification-email-modal">
        <DialogDescription>
          Your email update is pending verification. Please check your inbox
          (and spam folder) for a verification link to complete the update
          process.
        </DialogDescription>

        <DialogDescription className="font-bold">
          Your email will not be updated until the verification is completed.
        </DialogDescription>
      </div>

      <DialogFooter>
        <DialogClose>
          <Button>Ok</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

export default UpdateEmailInfo
