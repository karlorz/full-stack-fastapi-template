import { HTMLAttributes, ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card"

interface AppCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode
  description?: ReactNode
  header?: ReactNode
  children?: ReactNode
}

export function CustomCard({
  title,
  description,
  header,
  children,
  ...props
}: AppCardProps) {
  const hasHeader = title || description || header

  return (
    <Card
      className="w-full border border-black/5 dark:border-white/5 shadow-md shadow-black/[0.03] dark:shadow-black/30 bg-white dark:bg-zinc-900"
      {...props}
    >
      {hasHeader && (
        <CardHeader className="pb-4 md:pb-6 px-6 md:px-8">
          {header ? (
            header
          ) : (
            <>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </>
          )}
        </CardHeader>
      )}
      <CardContent className="pt-0 pb-6 md:pb-8 px-6 md:px-8 text-sm text-foreground">
        {children}
      </CardContent>
    </Card>
  )
}
