import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingApps = () => {
  return (
    <div>
      <div className="flex justify-between mb-10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Apps</h1>
          <p className="text-muted-foreground">
            View and manage all your applications.
          </p>
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="h-full">
            <CardHeader className="pb-2">
              <div>
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
                <Skeleton className="h-4 w-[200px] my-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-5 w-[120px]" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PendingApps
