import { useVirtualizer } from "@tanstack/react-virtual"
import React, { useEffect } from "react"
import type { Log } from "@/client"
import { cn } from "@/lib/utils"

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
    <div className="hover:bg-white/5 transition-colors">
      <span className="text-muted-foreground">[{timestamp}]</span>{" "}
      <span>{message}</span>
    </div>
  )
}

const LogContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "h-[400px] p-6 overflow-y-auto rounded-md bg-black text-white",
      "font-mono text-sm",
      "[&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar]:rounded-lg",
      "[&::-webkit-scrollbar-thumb]:rounded-lg",
      "[&::-webkit-scrollbar-thumb]:bg-white/20",
      "[&::-webkit-scrollbar]:bg-white/10",
      "[&::-webkit-scrollbar-corner]:bg-white/10",
      className,
    )}
    {...props}
  />
))
LogContainer.displayName = "LogContainer"

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
    <LogContainer ref={parentRef}>
      {logs.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p>No logs to show</p>
          <p>New logs will appear here when available</p>
        </div>
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
                {log && <LogLine time={log.timestamp} message={log.message} />}
              </div>
            )
          })}
        </div>
      )}
    </LogContainer>
  )
}

export default Logs
