import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingUserInformation = () => {
  return (
    <div className="container my-4 px-0 pt-10">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Full Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[70px]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[70px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 gap-0">
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <Skeleton className="h-5 w-[400px]" />
          </CardDescription>
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
            </div>
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-5 w-[250px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PendingUserInformation
