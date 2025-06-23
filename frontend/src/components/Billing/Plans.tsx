import { Check, X } from "lucide-react"

import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { cn } from "../../lib/utils"
import { items } from "./PlansData"

const Plans = () => {
  const listItems = items.map(
    ({ value, title, description, price, features }) => (
      <Card
        key={value}
        className={cn(
          "p-8 flex-1 mb-8",
          "transition-all duration-300 ease-in-out",
          "hover:shadow-sm hover:scale-105",
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="p-4 w-full text-center">
            <p className="uppercase font-bold">{title}</p>
          </div>
          <p className="text-md">{description}</p>
          <div className="text-center flex flex-col">
            <p className="text-4xl font-bold">$ {price}</p>
            <p className="text-sm">per month</p>
          </div>
          <ul className="space-y-2">
            {Object.values(features).map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                {feature.value ? (
                  <Check className="text-primary h-4 w-4" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    !feature.value && "line-through text-muted-foreground",
                  )}
                >
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
          <Button className="mt-6">Choose Plan</Button>
        </div>
      </Card>
    ),
  )

  return <div className="flex flex-col md:flex-row gap-10">{listItems}</div>
}

export default Plans
