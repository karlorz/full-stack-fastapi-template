import { ALL_TEAMS_COLUMNS } from "../Teams/columns"
import { Section } from "../ui/section"
import { PendingTable } from "./PendingTable"

const PendingTeams = () => (
  <Section title="All Teams" description="View and manage all your teams.">
    <PendingTable columns={ALL_TEAMS_COLUMNS} />
  </Section>
)

export default PendingTeams
