import { Link as RouterLink } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { Server } from "lucide-react"
import { Fragment } from "react"

import type { DeploymentPublic } from "@/client"
import { Status } from "@/components/Deployment/Status"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import EmptyState from "../Common/EmptyState"

export const RecentDeployments = ({
  deployments,
  limit = 3,
}: {
  deployments: Array<DeploymentPublic>
  limit?: number
}) => {
  return (
    <div className="space-y-2 p-4 rounded-lg border">
      <div className="text-sm font-medium text-muted-foreground mb-6">
        Recent Deployments
      </div>
      <div className="font-semibold">
        <ul className="text-sm">
          {deployments.slice(0, limit).map((deployment) => (
            <li
              key={deployment.id}
              className="flex justify-between items-center my-2"
            >
              <span className="text-muted-foreground font-normal">
                {formatDistanceToNow(new Date(deployment.created_at), {
                  addSuffix: true,
                })}
              </span>
              <Status status={deployment.status} />
            </li>
          ))}
        </ul>
        {deployments.length === 0 && (
          <span className="text-sm text-muted-foreground">
            No deployments yet
          </span>
        )}
      </div>
    </div>
  )
}

const Deployments = ({
  deployments,
}: { deployments: Array<DeploymentPublic> }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Server className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-md font-medium">Deployments Logs</h3>
      </div>

      {deployments?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            {deployments.map((deployment: DeploymentPublic) => (
              <Fragment key={deployment.id}>
                <div className="p-4 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      Deployment {deployment.id}
                    </div>
                    <Status status={deployment.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatDistanceToNow(new Date(deployment.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                  <RouterLink to={`./deployments/${deployment.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </RouterLink>
                </div>
              </Fragment>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No deployments yet"
          description="Your application has not been deployed yet. Once you deploy, you will see the deployment logs here."
        />
      )}
    </div>
  )
}

export default Deployments
