import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/$teamSlug/apps/$appSlug/")({
  loader: () => {
    throw redirect({
      to: "/$teamSlug/apps/$appSlug/general",
    })
  },
})
