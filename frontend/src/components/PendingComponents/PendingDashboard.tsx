import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingDashboard = () => (
  <div className="w-full p-0 space-y-6">
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl truncate max-w-full" data-testid="result">
          <Skeleton className="h-8 w-[250px]" />
        </div>
        <Skeleton className="mt-2 h-4 w-[200px]" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-[100px]" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[100px] w-full" />
      </CardContent>
    </Card>

    <div className="flex flex-col md:flex-row gap-4">
      <Card className="w-full md:w-[55%]">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[150px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="mt-4 h-8 w-[100px]" />
        </CardContent>
      </Card>

      <Card className="w-full md:w-[45%]">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[100px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-2 flex flex-col md:flex-row">
            <div>
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="mt-1 h-8 w-[30px]" />
              <Skeleton className="mt-1 h-3 w-[80px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export default PendingDashboard
