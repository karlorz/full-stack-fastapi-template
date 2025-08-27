import { Check, Copy, ExternalLink, Rocket, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FirstDeploymentGuideProps {
  appName: string
  onDismiss?: () => void
}

export default function FirstDeploymentGuide({
  appName,
  onDismiss,
}: FirstDeploymentGuideProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Deploy {appName}</span>
        </div>
        {onDismiss && (
          <Button variant="ghost" onClick={onDismiss} className="h-6 w-6 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-muted-foreground">First</span>
        <Button
          onClick={() => copyToClipboard("fastapi login")}
          variant="ghost"
          size="sm"
          className="bg-muted h-auto px-2 py-1 text-xs font-mono"
        >
          fastapi login
          {copiedCommand === "fastapi login" ? (
            <Check className="ml-1 h-3 w-3 text-green-500" />
          ) : (
            <Copy className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
        <span className="text-sm text-muted-foreground">then</span>
        <Button
          onClick={() => copyToClipboard("fastapi deploy")}
          variant="ghost"
          size="sm"
          className="bg-muted h-auto px-2 py-1 text-xs font-mono"
        >
          fastapi deploy
          {copiedCommand === "fastapi deploy" ? (
            <Check className="ml-1 h-3 w-3 text-green-500" />
          ) : (
            <Copy className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      </div>

      <a
        href="https://fastapicloud.com/docs/getting-started/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        View full deployment guide
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
