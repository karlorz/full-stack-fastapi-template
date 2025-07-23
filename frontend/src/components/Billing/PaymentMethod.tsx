import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"
import { CustomCard } from "../ui/custom-card"

const PaymentMethod = () => {
  return (
    <CustomCard>
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
    </CustomCard>
  )
}

export default PaymentMethod
