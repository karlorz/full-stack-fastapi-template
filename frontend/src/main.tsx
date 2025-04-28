import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import React, { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

import * as Sentry from "@sentry/react"
import { PostHogProvider } from "posthog-js/react"
import { ApiError, OpenAPI } from "./client"
import "./index.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "./components/theme-provider"

const posthogOptions = {
  api_host: import.meta.env.VITE_APP_PUBLIC_POSTHOG_HOST,
}

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

const handleApiError = (error: Error) => {
  if (
    error instanceof ApiError &&
    [401, 403].includes(error.status) &&
    !window.location.pathname.startsWith("/login") &&
    !window.location.pathname.startsWith("/reset-password")
  ) {
    localStorage.removeItem("current_team")
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

export const router = createRouter({ routeTree, context: { queryClient } })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://75a90282fd5039a35d27d87f0e024476@o4506985151856640.ingest.us.sentry.io/4506985170599936",
    integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
  })
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_APP_PUBLIC_POSTHOG_KEY as string}
      options={posthogOptions}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </PostHogProvider>
  </StrictMode>,
)
