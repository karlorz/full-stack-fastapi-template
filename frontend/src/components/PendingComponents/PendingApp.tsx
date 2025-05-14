import { Code2, Globe, Terminal } from "lucide-react"
import { Fragment } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PendingApp = () => {
  return (
    <div>
      <Skeleton className="h-8 w-[150px] mb-10" />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle>App Details</CardTitle>
              </div>
              <CardDescription>Overview of your application</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-md font-medium">General Information</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2 p-4 rounded-lg border">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-36" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center"
                          >
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Fragment key={i}>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Separator />
                  </Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>

            <CardContent>
              <div className="bg-secondary/50 rounded-lg p-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full mb-2" />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PendingApp
