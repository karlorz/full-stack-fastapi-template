import { queryOptions } from "@tanstack/react-query"

import { TeamsService } from "@/client"
import { fetchTeamBySlug } from "@/utils"

export const getTeamsQueryOptions = () =>
  queryOptions({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

export const getTeamQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["teams", slug],
    queryFn: () => fetchTeamBySlug(slug),
  })
