import type { ReactNode } from "react"
import Appearance from "../UserSettings/Appearance"

interface BackgroundPanelProps {
  children: ReactNode
}

const BackgroundPanel = ({ children }: BackgroundPanelProps) => {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center p-4">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
      <header className="sticky top-0 h-16 w-full px-4 flex items-center justify-end">
        <Appearance />
      </header>
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
      <footer className="text-center text-sm text-zinc-500 dark:text-zinc-400 font-body tracking-wide select-none">
        © 2025 FastAPI Labs, Inc ·{" "}
        <a
          href="https://fastapicloud.com/legal/terms"
          target="_blank"
          className="hover:underline"
          rel="noopener"
        >
          Terms of Use
        </a>{" "}
        ·{" "}
        <a
          href="https://fastapicloud.com/legal/privacy-policy"
          target="_blank"
          className="hover:underline"
          rel="noopener"
        >
          Privacy Policy
        </a>
      </footer>
    </div>
  )
}

export default BackgroundPanel
