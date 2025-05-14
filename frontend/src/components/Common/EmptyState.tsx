import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  onButtonClick?: () => void
  testId?: string
}

const EmptyState = ({
  title,
  description,
  buttonText,
  onButtonClick,
  testId,
}: EmptyStateProps) => {
  return (
    <div className="col-span-3 flex justify-center" data-testid={testId}>
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-md text-center mb-6">
          <h2 className="text-lg font-bold mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mb-6">{description}</p>
          )}
          {buttonText && onButtonClick && (
            <Button onClick={onButtonClick}>{buttonText}</Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmptyState
