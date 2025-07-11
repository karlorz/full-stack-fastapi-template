import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface CodeWithCopyProps {
  code: string
  padding?: number
}

const PIP_INSTALL_COMMAND = `pip install --upgrade "fastapi[standard]"`

const UV_INSTALL_COMMAND = `uv add --upgrade "fastapi[standard]"`

const CodeWithCopy = ({ code }: CodeWithCopyProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 bg-muted my-2 rounded-md">
      <code className="text-xs flex-1 px-4 py-3">{code}</code>
      <Button
        variant="ghost"
        size="icon"
        className={`transition-all cursor-pointer mr-2 ${
          copied
            ? "text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300"
            : "hover:bg-primary/10 dark:hover:bg-primary/20"
        }`}
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

const InstallInstructions = () => (
  <Tabs defaultValue="uv">
    <TabsList>
      <TabsTrigger value="uv">uv</TabsTrigger>
      <TabsTrigger value="pip">pip</TabsTrigger>
    </TabsList>
    <TabsContent value="uv">
      <CodeWithCopy code={UV_INSTALL_COMMAND} />
    </TabsContent>
    <TabsContent value="pip">
      <CodeWithCopy code={PIP_INSTALL_COMMAND} />
    </TabsContent>
  </Tabs>
)

const QuickStart = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          View Guide
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-4 px-6">
          <SheetTitle>QuickStart Guide</SheetTitle>
        </SheetHeader>
        <div data-testid="fastapi-cli" className="space-y-6 px-6">
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Installation</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Get started by installing FastAPI Cloud CLI, your primary tool
                for deploying FastAPI apps to the cloud.
              </p>
              <InstallInstructions />
            </div>
          </div>
          <Separator className="-mx-6" />
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Deploying your app</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Before deploying, ensure you have a{" "}
                <a
                  className="text-primary hover:underline"
                  href="https://fastapi.tiangolo.com/virtual-environments/"
                  target="_blank"
                  rel="noreferrer"
                >
                  virtual environment
                </a>{" "}
                activated.
              </p>
              <div>
                1. Login to FastAPI Cloud:{" "}
                <CodeWithCopy code={"fastapi login"} />
              </div>
              <div>
                2. Deploy your app: <CodeWithCopy code={"fastapi deploy"} />
              </div>
              <p>
                And that's it! Your app will be deployed to the cloud in
                seconds.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default QuickStart
