import {
  experimental_streamedQuery as streamedQuery,
  useQuery,
} from "@tanstack/react-query"
import { z } from "zod"
import { OpenAPI } from "@/client"

const BuildLogMessage = z.object({
  message: z.string(),
  type: z.literal("message").default("message"),
})

const BuildLogComplete = z.object({
  type: z.literal("complete").default("complete"),
})

const BuildLogFailed = z.object({
  type: z.literal("failed").default("failed"),
})

const BuildLog = z.union([BuildLogMessage, BuildLogComplete, BuildLogFailed])

const handleLog = (line: string) => {
  if (line.trim() === "") {
    return null
  }

  return BuildLog.parse(JSON.parse(line))
}

export const useBuildLogs = ({
  deploymentId,
  enabled = true,
}: {
  deploymentId: string
  enabled?: boolean
}) => {
  async function* fetchLogs() {
    const url = `${OpenAPI.BASE}/api/v1/deployments/${deploymentId}/build-logs`
    const token = localStorage.getItem("access_token")
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error("No response body")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split("\n")
        // Keep the last line in buffer (might be incomplete)
        buffer = lines.pop() || ""

        for (const line of lines) {
          const log = handleLog(line)

          if (log && log.type === "message") {
            yield log
          } else if (log) {
            return
          }
        }
      }

      if (buffer.trim() !== "") {
        const log = handleLog(buffer)

        if (log && log.type === "message") {
          yield log
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  const { data: logs } = useQuery({
    queryKey: ["build-logs", deploymentId],
    queryFn: streamedQuery({
      queryFn: fetchLogs,
    }),
    enabled,
  })

  return logs ?? []
}
