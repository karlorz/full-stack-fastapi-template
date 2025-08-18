import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { Badge } from "@/components/ui/badge"
import { CustomCard } from "@/components/ui/custom-card"
import { Skeleton } from "../../components/ui/skeleton"
import DangerZoneAlert from "../Common/DangerZone"

const PendingUserInformation = () => (
  <div className="space-y-10">
    {/* Profile Information */}
    <CustomCard
      title="Profile Information"
      description="Update your personal information."
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </CustomCard>

    {/* Security */}
    <CustomCard
      title="Security"
      description="Manage your password and security settings."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div className="space-y-2" key={i}>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </CustomCard>

    {/* Connected Accounts */}
    <CustomCard
      title="Connected Accounts"
      description="Manage your connected accounts and integrations."
    >
      <div className="divide-y divide-border">
        {/* GitHub */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <FaGithub className="h-5 w-5 text-accent-foreground" />
            <div>
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-4 w-[80px] mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-[160px]" />
        </div>
        {/* Google */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <FcGoogle className="h-5 w-5" />
            <div>
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-4 w-[80px] mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted">Coming Soon</Badge>
            <Skeleton className="h-8 w-[80px]" />
          </div>
        </div>
      </div>
    </CustomCard>

    {/* Danger Zone */}
    <CustomCard>
      <DangerZoneAlert description="Permanently delete your data and everything associated with your account.">
        <Skeleton className="h-10 w-32" />
      </DangerZoneAlert>
    </CustomCard>
  </div>
)

export default PendingUserInformation
