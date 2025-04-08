import { Fragment } from "react"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const PendingApps = () => (
  <div className="w-full p-0">
    <h1 className="text-3xl font-bold pb-2">Apps</h1>
    <p className="text-inherit">View and manage apps related to your team.</p>
    <div className="flex justify-start md:justify-end my-4">
      <Skeleton className="h-10 w-[100px]" />
    </div>
    <Card className="p-6">
      <div className="flex flex-col">
        {[...Array(5)].map((_, index) => (
          <Fragment key={index}>
            <div className="flex items-center mb-2 py-4">
              <Skeleton className="h-5 w-[150px]" />
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
    </Card>
  </div>
)

export default PendingApps
