import { Circle } from "@chakra-ui/react"
import type { LucideIcon } from "lucide-react"

interface TeamIconProps {
  bg: string
  icon?: LucideIcon
  initials?: string
}

const TeamIcon = ({ bg, icon: IconComponent, initials }: TeamIconProps) => {
  return (
    <Circle bg={bg} size="30px" color="white" p={2}>
      {initials ? initials : IconComponent && <IconComponent />}
    </Circle>
  )
}

export default TeamIcon
