import { DeploymentsService } from "@/client"
import { queryOptions } from "@tanstack/react-query"

export const getDeploymentsQueryOptions = (appId: string) =>
  queryOptions({
    queryKey: ["deployments", appId],
    queryFn: () =>
      DeploymentsService.readDeployments({
        appId,
        orderBy: "created_at",
        limit: 5,
      }),
    refetchInterval: 10000,
  })

export const getDeploymentQueryOptions = (
  appId: string,
  deploymentId: string,
) =>
  queryOptions({
    queryKey: ["deployments", deploymentId],
    queryFn: () =>
      DeploymentsService.readDeployment({
        appId,
        deploymentId,
      }),
    refetchInterval: 5000,
  })

export const getLogsQueryOptions = (deploymentId: string) =>
  queryOptions({
    queryKey: ["deployment-logs", deploymentId],
    queryFn: () =>
      DeploymentsService.readDeploymentLogs({
        deploymentId,
      }),
    refetchInterval: 5000,
  })
