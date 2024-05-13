import {
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

import Billing from "../../../components/TeamSettings/Billing"
import DeleteTeam from "../../../components/TeamSettings/DeleteTeam"
import TeamInfo from "../../../components/TeamSettings/TeamInfo"

const tabsConfig = [
  { title: "Team", component: TeamInfo },
  { title: "Billing", component: Billing },
  { title: "Danger zone", component: DeleteTeam },
]

export const Route = createFileRoute("/_layout/$team/settings")({
  component: TeamSettings,
})

function TeamSettings() {
  return (
    <Container maxW="full" p={12}>
      <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
        Settings
      </Heading>
      <Text>View and manage settings related to your team.</Text>
      <Tabs variant="line" pt={10}>
        <TabList>
          {tabsConfig.map((tab, index) => (
            <Tab key={index}>{tab.title}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabsConfig.map((tab, index) => (
            <TabPanel key={index}>
              <Suspense>
                <tab.component />
              </Suspense>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Container>
  )
}
