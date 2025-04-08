import type { LucideIcon } from "lucide-react"

interface TeamIconProps {
  icon?: LucideIcon
  initials?: string
}

const TeamIcon = ({ icon: IconComponent, initials }: TeamIconProps) => {
  return (
    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-white bg-gray-600 p-2">
      {initials
        ? initials
        : IconComponent && <IconComponent className="text-white" />}
    </div>
  )
}

export default TeamIcon
