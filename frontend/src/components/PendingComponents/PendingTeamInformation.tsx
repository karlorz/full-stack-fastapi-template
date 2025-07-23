import { CustomCard } from "@/components/ui/custom-card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingTeamInformation = () => (
  <div className="w-full my-4 pt-10">
    <CustomCard
      title="Team Information"
      description="Update your team’s information."
    >
      <h3 className="font-semibold mb-4">Team Name</h3>
      <Skeleton className="h-5 w-full md:w-1/2" />
    </CustomCard>
  </div>
)

export default PendingTeamInformation
