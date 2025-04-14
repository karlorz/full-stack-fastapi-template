import logo from "@/assets/logo.svg"
import type { ReactNode } from "react"

interface BackgroundPanelProps {
  children: ReactNode
}

const BackgroundPanel = ({ children }: BackgroundPanelProps) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center self-center font-medium">
          <img
            src={logo}
            alt="FastAPI Cloud"
            className="h-6
          w-auto dark:invert-0 invert"
          />
        </a>
        {children}
      </div>
    </div>
  )
}

export default BackgroundPanel
