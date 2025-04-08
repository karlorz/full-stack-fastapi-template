import React from "react"

import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { cn } from "../../lib/utils"

const CurrentPlan = () => {
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
            <p className="font-bold">Team</p>
            <p>
              Current plan ends on{" "}
              <span className="font-bold">June 23, 2024</span>.
            </p>
            <p>
              Need any help? Contact us at{" "}
              <span className="font-bold">billing@fastapilabs.com</span>
            </p>
            <Button variant="destructive">Cancel Subscription</Button>
          </div>
          <Button variant="outline">Upgrade</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrentPlan
