import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"

const PendingAppLayout = () => {
  return (
    <Section title="App Details">
      <div className="space-y-6">
        {/* Navigation skeleton */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-16" />
          </nav>
        </div>

        {/* Content skeleton */}
        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </Section>
  )
}

export default PendingAppLayout
