import { Copy } from "lucide-react"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

export interface CodeWithCopyProps {
  code: string
  padding?: number
}

const PIP_INSTALL_COMMAND =
  "pip install --upgrade --index-url https://pypi.fastapicloud.com/simple --extra-index-url https://pypi.python.org/simple fastapi-cli fastapi-cloud-cli"

const UV_INSTALL_COMMAND =
  "uv add --upgrade --default-index https://fastapi-cli.pages.dev/simple --index-strategy unsafe-best-match --index https://pypi.python.org/simple fastapi-cli fastapi-cloud-cli"

const CodeWithCopy = ({ code }: CodeWithCopyProps) => (
  <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
    <code className="text-sm flex-1">{code}</code>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => navigator.clipboard.writeText(code)}
    >
      <Copy className="h-4 w-4" />
    </Button>
  </div>
)

const InstallInstructions = () => (
  <Tabs defaultValue="uv" className="h-40">
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
    <div className="flex flex-col md:flex-row" data-testid="fastapi-cli">
      <div className="flex-1 flex flex-col gap-2 p-6">
        <p>
          FastAPI Cloud CLI is your primary tool for managing your apps. Before
          you start, make sure you have it installed.
        </p>
        <InstallInstructions />
      </div>

      <Separator className="md:h-auto" orientation="vertical" />

      <div className="flex-1 flex flex-col gap-2 p-6">
        <p>
          Once you have FastAPI Cloud CLI installed, you can deploy your app,
          make sure you have your{" "}
          <a
            className="text-primary hover:underline"
            href="https://fastapi.tiangolo.com/virtual-environments/"
            target="_blank"
            rel="noreferrer"
          >
            virtual environment
          </a>{" "}
          activated. Then follow the instructions below to deploy your app:
        </p>
        <p>
          1. Login to FastAPI Cloud:{" "}
          <code className="text-sm bg-muted px-2 py-1 rounded">
            fastapi login
          </code>
        </p>
        <p>
          2. Deploy your app:{" "}
          <code className="text-sm bg-muted px-2 py-1 rounded">
            fastapi deploy
          </code>
        </p>
        <p>And that's it! Your app will be deployed to the cloud in seconds.</p>
      </div>
    </div>
  )
}

export default QuickStart
