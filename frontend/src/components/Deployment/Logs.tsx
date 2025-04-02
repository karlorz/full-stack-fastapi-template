import type { Log } from "@/client"
import { Box, Text } from "@chakra-ui/react"
import { useVirtualizer } from "@tanstack/react-virtual"
import React, { useEffect } from "react"

interface LogLineProps {
  time: string
  message: string
}

interface LogsProps {
  logs: Log[]
}

const LogLine = ({ time, message }: LogLineProps) => {
  const timestamp = new Date(time).toLocaleString()
  return (
    <Box _hover={{ bg: "whiteAlpha.50" }} transition="background 0.2s">
      <Text as="span" color="gray.400">
        [{timestamp}]
      </Text>{" "}
      <Text as="span">{message}</Text>
    </Box>
  )
}

const Logs = ({ logs }: LogsProps) => {
  const parentRef = React.useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: logs.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 22,
  })

  useEffect(() => {
    if (logs.length > 0) {
      const lastIndex = logs.length - 1
      rowVirtualizer.scrollToIndex(lastIndex, {
        align: "end",
        behavior: "smooth",
      })
    }
  }, [logs.length, rowVirtualizer])

  return (
    <>
      <Box
        ref={parentRef}
        h="400px"
        p={6}
        overflowY="auto"
        borderRadius="md"
        bg="gray.950"
        color="white"
        fontFamily="monospace"
        fontSize="sm"
        css={{
          "&::-webkit-scrollbar": {
            borderRadius: "8px",
            width: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
          "&::-webkit-scrollbar-corner": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        {logs.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
          >
            <Text>No logs to show</Text>
            <Text>New logs will appear here when available</Text>
          </Box>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const log = logs[virtualItem.index]
              return (
                <div
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {log && (
                    <LogLine time={log.timestamp} message={log.message} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Box>
    </>
  )
}

export default Logs
