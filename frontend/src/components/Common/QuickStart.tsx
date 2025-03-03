import { Code, Flex, Separator, Stack, Tabs, Text } from "@chakra-ui/react"

import { ClipboardIconButton, ClipboardRoot } from "../ui/clipboard"
import CustomCard from "./CustomCard"

export interface CodeWithCopyProps {
  code: string
  padding?: number
}

const PIP_INSTALL_COMMAND =
  "pip install --upgrade --index-url https://pypi.fastapicloud.com/simple --extra-index-url https://pypi.python.org/simple fastapi-cli fastapi-cloud-cli"

const UV_INSTALL_COMMAND =
  "uv add --upgrade --default-index https://fastapi-cli.pages.dev/simple --index-strategy unsafe-best-match --index https://pypi.python.org/simple fastapi-cli fastapi-cloud-cli"

const CodeWithCopy = ({ code }: CodeWithCopyProps) => (
  <Flex>
    <Code p={2}>{code}</Code>
    <ClipboardRoot value={code}>
      <ClipboardIconButton variant="ghost" />
    </ClipboardRoot>
  </Flex>
)

const InstallInstructions = () => (
  <>
    <Tabs.Root defaultValue="uv" variant="subtle" h="10rem">
      <Tabs.List>
        <Tabs.Trigger value="uv">uv</Tabs.Trigger>
        <Tabs.Trigger value="pip">pip</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="uv">
        <CodeWithCopy code={UV_INSTALL_COMMAND} />
      </Tabs.Content>
      <Tabs.Content value="pip">
        <CodeWithCopy code={PIP_INSTALL_COMMAND} />
      </Tabs.Content>
    </Tabs.Root>
  </>
)

const QuickStart = () => {
  return (
    <CustomCard data-testid="fastapi-cli" w="100%">
      <Stack direction={{ base: "column", md: "row" }}>
        <Flex flexDir="column" gap={2} flex="1">
          <Text>
            FastAPI Cloud CLI is your primary tool for managing your apps.
            Before you start, make sure you have it installed.
          </Text>

          <InstallInstructions />
        </Flex>
        <Separator orientation="vertical" p={2} h="auto" />
        <Flex flexDir="column" gap={2} flex="1">
          <Text>
            Once you have FastAPI Cloud CLI installed, you can deploy your app,
            make sure you have your{" "}
            <a
              className="main-link"
              href="https://fastapi.tiangolo.com/virtual-environments/"
              target="_blank"
              rel="noreferrer"
            >
              virtual environment
            </a>{" "}
            activated. Then follow the instructions below to deploy your app:
          </Text>
          <Text>
            1. Login to FastAPI Cloud: <Code>fastapi login</Code>
          </Text>

          <Text>
            2. Deploy your app: <Code>fastapi deploy</Code>
          </Text>

          <Text>
            And that's it! Your app will be deployed to the cloud in seconds.
          </Text>
        </Flex>
      </Stack>
    </CustomCard>
  )
}

export default QuickStart
