import { createFileRoute } from "@tanstack/react-router"

import AllTeams from "../../../components/Teams/AllTeams"

export const Route = createFileRoute("/_layout/teams/all")({
  component: AllTeams,
})
