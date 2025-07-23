import { CustomCard } from "@/components/ui/custom-card"
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"

const PendingApps = () => {
  return (
    <Section
      title="Apps"
      description="View and manage all your applications."
      action={<Skeleton className="h-10 w-[120px]" />}
    >
      <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        {[...Array(3)].map((_, index) => (
          <CustomCard
            key={index}
            className="flex flex-col justify-between"
            header={
              <>
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-[150px] rounded" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
                <Skeleton className="h-5 w-full my-2 rounded" />
              </>
            }
          >
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Last Updated
                </div>
                <Skeleton className="h-4 w-[100px] rounded" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground truncate">
                  Region
                </div>
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
          </CustomCard>
        ))}
      </div>
    </Section>
  )
}

export default PendingApps
