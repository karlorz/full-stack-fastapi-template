import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import AllTeams from "../../../components/Teams/AllTeams"

const teamsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  orderBy: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export const Route = createFileRoute("/_layout/teams/all")({
  component: AllTeams,
  validateSearch: (search) => teamsSearchSchema.parse(search),
})
