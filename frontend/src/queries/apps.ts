import { queryOptions } from "@tanstack/react-query"

import { AppsService } from "@/client"
import {
  fetchAppBySlug,
  fetchLastApp,
  fetchLastAppsInLast30Days,
} from "@/utils"

export const getRecentAppsQueryOptions = (teamId: string) =>
  queryOptions({
    queryKey: ["apps", teamId, "recent"],
    queryFn: () => fetchLastAppsInLast30Days(teamId),
  })

export const getLastAppQueryOptions = (teamId: string) =>
  queryOptions({
    queryKey: ["apps", teamId, "last"],
    queryFn: () => fetchLastApp(teamId),
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
