import { AppsService } from "@/client"
import { fetchAppBySlug, fetchAppsData } from "@/utils"
import { queryOptions } from "@tanstack/react-query"

export const getDashboardDataQueryOptions = (teamId: string) =>
  queryOptions({
    queryKey: ["apps", teamId, "dashboard"],
    queryFn: () => fetchAppsData(teamId),
  })

export const getAppsQueryOptions = (teamId: string) =>
  queryOptions({
    queryKey: ["apps", teamId],
    queryFn: () => AppsService.readApps({ teamId }),
  })

export const getAppQueryOptions = (teamId: string, appSlug: string) =>
  queryOptions({
    queryKey: ["app", appSlug],
    queryFn: () => fetchAppBySlug(teamId, appSlug),
  })

export const getEnvVarQueryOptions = (appId: string) =>
  queryOptions({
    queryKey: ["apps", appId, "environmentVariables"],
    queryFn: () => AppsService.readEnvironmentVariables({ appId }),
  })

export const getAppLogsQueryOptions = (appId: string) =>
  queryOptions({
    queryKey: ["app-logs", appId],
    queryFn: () =>
      AppsService.readAppLogs({
        appId,
      }),
    refetchInterval: 5000,
  })
