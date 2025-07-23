import { ReactNode } from "react"

interface SectionProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Section({
  title,
  description,
  action,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`w-full px-2 sm:px-6 md:px-8 xl:px-12 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base sm:text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="mt-4 sm:mt-0 sm:ml-4">{action}</div>}
      </div>
      <div className="pt-6 sm:pt-10 md:pt-12">{children}</div>
    </section>
  )
}
