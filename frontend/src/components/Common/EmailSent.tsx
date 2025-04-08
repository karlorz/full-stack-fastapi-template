import Lottie from "lottie-react"

import emailSent from "@/assets/email.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const EmailSent = ({ email }: { email: string }) => {
  return (
    <Card data-testid="email-sent">
      <CardHeader>
        <CardTitle>One More Step!</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-4">
        <Lottie animationData={emailSent} loop={false} className="h-20 w-20" />
        We've sent you an email at <span className="font-bold">{email}</span>.
        Please follow the instructions. Check your spam folder if you don't see
        it in your inbox.
      </CardContent>
    </Card>
  )
}

export default EmailSent
