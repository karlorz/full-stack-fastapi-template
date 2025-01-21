import { AppsService } from "@/client"
import { Box, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useVirtualizer } from "@tanstack/react-virtual"
import React from "react"
import CustomCard from "../Common/CustomCard"

interface LogLineProps {
  time: string
  message: string
}

interface LogsProps {
  appId: string
}

const LogLine = ({ time, message }: LogLineProps) => {
  return (
    <Box
      fontFamily="mono"
      fontSize="sm"
      py={1}
      _hover={{ bg: "whiteAlpha.50" }}
      transition="background 0.2s"
    >
      <Text as="span" color="gray.500">
        [{time}]
      </Text>{" "}
      <Text as="span">{message}</Text>
    </Box>
  )
}

const Logs = ({ appId }: LogsProps) => {
  const parentRef = React.useRef(null)
  const { data } = useQuery({
    queryKey: ["logs"],
    queryFn: () =>
      AppsService.readAppLogs({
        appId: appId,
      }),
  })

  const rowVirtualizer = useVirtualizer({
    count: data?.logs.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  })

  return (
    <>
      <CustomCard title="Logs">
        <Box
          ref={parentRef}
          h="400px"
          overflowY="auto"
          borderRadius="md"
          p={4}
          css={{
            "&::-webkit-scrollbar": {
              borderRadius: "8px",
              width: "16px",
              backgroundColor: "rgba(0, 0, 0, 0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
            "&::-webkit-scrollbar-corner": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
            },
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const log = data?.logs[virtualItem.index]
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
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
        </Box>
      </CustomCard>
    </>
  )
}

export default Logs
