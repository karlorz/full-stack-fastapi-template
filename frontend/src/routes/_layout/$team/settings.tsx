import { Container, Heading, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import TeamInformation from "../../../components/TeamSettings/TeamInformation"

// const tabsConfig = [
//   { title: "Team", component: TeamInformation },
//   { title: "Billing", component: Billing },
// ]

// TODO:Add Billing component when it's ready

export const Route = createFileRoute("/_layout/$team/settings")({
  component: TeamSettings,
})

function TeamSettings() {
  return (
    <Container maxW="full" p={0}>
      <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
        Team Settings
      </Heading>
      <Text>View and manage settings related to your team.</Text>
      <TeamInformation />
      {/* <Tabs variant="basic" pt={10}>
        <TabList>
          {tabsConfig.map((tab, index) => (
            <Tab key={index}>{tab.title}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabsConfig.map((tab, index) => (
            <TabPanel key={index} p={0}>
              <Suspense>
                <tab.component />
              </Suspense>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs> */}
    </Container>
  )
}
