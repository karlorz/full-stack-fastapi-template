import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription } from "@/components/ui/card"

interface EmptyStateProps {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  icon: LucideIcon
}

const EmptyState = ({
  title,
  description,
  icon: IconComponent,
}: EmptyStateProps) => {
  return (
    <Card className="w-full flex items-center justify-center flex-col p-6">
      <CardContent className="flex flex-col items-center space-y-4 pt-6">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-center m-1">{title}</h3>
        <CardDescription>
          {description && (
            <p className="text-center text-muted-foreground">{description}</p>
          )}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

export default EmptyState
