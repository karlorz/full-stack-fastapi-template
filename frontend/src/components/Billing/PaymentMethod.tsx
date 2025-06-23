import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { cn } from "../../lib/utils"

const PaymentMethod = () => {
  return (
    <Card>
      <CardContent className="p-8">
        <div
          className={cn(
            "flex gap-4",
            "flex-col md:flex-row items-start justify-between",
          )}
        >
          <div className="flex flex-col gap-4">
            <p className="font-bold">Payment Method</p>
            {/* TODO: Temporary image */}
            <img
              className="w-[50px]"
              src="https://1000marcas.net/wp-content/uploads/2019/12/VISA-Logo-2014.png"
              alt="Payment Method"
            />
            <div className="flex flex-col">
              <p className="font-bold">**** **** **** 1234</p>
              <p>Exp Date: 06/2024</p>
            </div>
          </div>
          <Button variant="outline">Update Card</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentMethod
