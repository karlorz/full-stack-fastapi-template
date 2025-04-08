import { Fragment } from "react"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const PendingTeams = () => (
  <div className="w-full p-0">
    <div className="mb-10">
      <h1 className="text-3xl font-bold pb-2">Teams</h1>
      <p>View all your teams</p>
    </div>

    <Card className="p-6">
      <div className="flex flex-col">
        {[...Array(5)].map((_, index) => (
          <Fragment key={index}>
            <div className="flex items-center mb-2 py-4">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-5 w-[50px] ml-2" />
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
      <div className="flex justify-end mt-4 gap-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </Card>
  </div>
)

export default PendingTeams
