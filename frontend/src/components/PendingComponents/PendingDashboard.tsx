import { LayoutGrid, Rocket } from "lucide-react"
import { CustomCard } from "@/components/ui/custom-card"
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"

const PendingDashboard = () => {
  return (
    <Section
      title={
        <span className="flex items-center gap-2">
          Hi, <Skeleton className="h-6 w-[120px]" />
        </span>
      }
      description="Welcome to FastAPI Cloud! Here's what's happening with your applications."
      data-testid="result"
    >
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        <CustomCard
          title="Total Applications"
          description="Number of apps in your team"
        >
          <div className="flex items-center justify-between pt-4">
            <div>
              <Skeleton className="h-8 w-16 mb-2" />
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
              <LayoutGrid className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Skeleton className="h-6 w-24" />
          </div>
        </CustomCard>

        <CustomCard
          title="Last Deployed App"
          description={<Skeleton className="h-4 w-32" />}
        >
          <div className="flex items-center justify-between pt-4">
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
              <Rocket className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Skeleton className="h-9 w-24" />
          </div>
        </CustomCard>
      </div>
    </Section>
  )
}

export default PendingDashboard
