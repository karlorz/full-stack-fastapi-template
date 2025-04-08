import { Link as RouterLink } from "@tanstack/react-router"
import { PackageOpen } from "lucide-react"
import { Fragment } from "react"

import type { DeploymentPublic } from "@/client"
import { Status } from "@/components/Deployment/Status"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import EmptyState from "../Common/EmptyState"

const Deployments = ({
  deployments,
}: { deployments: Array<DeploymentPublic> }) => {
  return (
    <>
      {deployments?.length > 0 ? (
        <>
          {deployments.map((deployment: DeploymentPublic) => (
            <Fragment key={deployment.id}>
              <RouterLink to={`./deployments/${deployment.id}`}>
                <div
                  className={cn(
                    "flex items-center justify-between mb-2 cursor-pointer",
                    "hover:bg-muted/50 transition-colors",
                  )}
                >
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-primary hover:underline">
                        {deployment.id}
                      </span>
                      <Status deployment={deployment} />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Created At:{" "}
                      {new Date(deployment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </RouterLink>
              <Separator className="my-2" />
            </Fragment>
          ))}
        </>
      ) : (
        <div className="flex justify-center w-full">
          <EmptyState
            title="You don't have any deployments yet"
            icon={PackageOpen}
          />
        </div>
      )}
    </>
  )
}

export default Deployments
