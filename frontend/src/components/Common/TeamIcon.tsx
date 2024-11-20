import { Circle, type IconProps } from "@chakra-ui/react"
import type { FC } from "react"

interface TeamIconProps {
  bg: string
  icon?: FC<IconProps>
  initials?: string
}

const TeamIcon = ({ bg, icon: IconComponent, initials }: TeamIconProps) => {
  return (
    <Circle bg={bg} size="30px" color="white">
      {initials ? initials : IconComponent && <IconComponent size="sm" />}
    </Circle>
  )
}

export default TeamIcon
