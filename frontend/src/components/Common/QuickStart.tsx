import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

export interface CodeWithCopyProps {
  code: string
  padding?: number
}

const PIP_INSTALL_COMMAND = `pip install --upgrade --index-url https://pypi.fastapicloud.com/simple --extra-index-url https://pypi.python.org/simple fastapi-cli fastapi-cloud-cli "fastapi[standard]"`

const UV_INSTALL_COMMAND = `uv add --upgrade --default-index https://fastapi-cli.pages.dev/simple --index-strategy unsafe-best-match --index https://pypi.python.org/simple fastapi-cli fastapi-cloud-cli "fastapi[standard]"`

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
  <Tabs defaultValue="uv" className="h-40 my-2">
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
    <div className="flex flex-col gap-6 md:flex-row" data-testid="fastapi-cli">
      <div className="flex-1 flex flex-col">
        <h1 className="font-semibold mb-4">Installation</h1>
        <div className="text-sm text-muted-foreground">
          <p>
            Get started by installing FastAPI Cloud CLI, your primary tool for
            deploying FastAPI apps to the cloud.
          </p>
          <InstallInstructions />
        </div>
      </div>

      <Separator className="md:h-auto" orientation="vertical" />

      <div className="flex-1 flex flex-col">
        <h1 className="font-semibold mb-4">Deploying your app</h1>
        <div className="text-sm text-muted-foreground">
          <p>
            Before deploying, ensure you have a {""}
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
          <p className="mt-2">
            1. Login to FastAPI Cloud: <CodeWithCopy code={"fastapi login"} />
          </p>
          <p>
            2. Deploy your app: <CodeWithCopy code={"fastapi deploy"} />
          </p>
          <p>
            And that's it! Your app will be deployed to the cloud in seconds.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuickStart
