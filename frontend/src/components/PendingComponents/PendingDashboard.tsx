import { LayoutGrid, Rocket } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingDashboard = () => {
  return (
    <div className="w-full p-0 space-y-6">
      <div data-testid="result" className="mb-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>Hi, </span>
          <Skeleton className="h-8 w-[200px] inline-block" />
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to FastAPI Cloud! Here's what's happening with your
          applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 lg:grid-cols-2 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-8 w-[60px] mt-1" />
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-6 w-[100px]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-5 w-[100px] mt-1" />
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-9 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PendingDashboard
