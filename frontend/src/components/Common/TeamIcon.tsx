import { Icon } from "@chakra-ui/icons"
import { Circle } from "@chakra-ui/react"
import type { ElementType } from "react"

interface TeamIconProps {
  bg: string
  icon?: ElementType
  initials?: string
}

const TeamIcon = ({ bg, icon, initials }: TeamIconProps) => {
  return (
    <Circle bg={bg} size="30px" color="white">
      {initials ? initials : <Icon as={icon} />}
    </Circle>
  )
}

export default TeamIcon
