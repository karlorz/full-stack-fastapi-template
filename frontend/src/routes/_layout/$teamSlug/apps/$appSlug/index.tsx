import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/$teamSlug/apps/$appSlug/")({
  loader: ({ params: { teamSlug, appSlug } }) => {
    throw redirect({
      to: "/$teamSlug/apps/$appSlug/$tab",
      params: { teamSlug, appSlug, tab: "general" },
    })
  },
})
