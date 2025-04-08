import { CircleIcon } from "lucide-react"
import { Fragment } from "react"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const PendingApp = () => (
  <div className="w-full p-0">
    <div className="pb-2">
      <Skeleton className="h-10 w-[300px]" />
    </div>
    <div className="pb-10">
      <Skeleton className="h-5 w-[200px]" />
      <div className="pt-10 space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Deployments</h3>
          <div className="flex flex-col space-y-4">
            {[...Array(5)].map((_, index) => (
              <Fragment key={index}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col space-y-2">
                      <Skeleton className="h-5 w-[150px]" />
                      <Skeleton className="h-5 w-[100px]" />
                    </div>
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                </div>
                <Separator />
              </Fragment>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Environment Variables</h3>
          <Skeleton className="h-[250px] w-full" />
        </Card>

        <Card className="p-6">
          <div className="w-full p-0">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <CircleIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Danger Zone</h3>
                  <Skeleton className="h-4 w-[400px]" />
                </div>
              </div>
              <Skeleton className="h-10 w-[100px] mt-4 md:mt-0" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
)

export default PendingApp
