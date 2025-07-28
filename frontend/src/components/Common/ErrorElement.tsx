import { Link, useRouterState } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { useTextScramble } from "@/hooks/useTextScramble"

const ErrorElement = () => {
  const { location } = useRouterState()
  const { text: scrambledOops } = useTextScramble("Oops!", 450)

  return (
    <div
      className="relative flex h-screen flex-col items-center justify-center p-4 text-primary dark:overflow-hidden bg-gradient-to-br from-background to-secondary"
      data-testid="error-element"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />

      <div className="z-10 flex items-center">
        <div className="flex flex-col items-center justify-center p-4">
          <h2 className="relative mb-4 text-[6rem] font-bold leading-none md:text-[8rem] font-mono text-primary cursor-pointer">
            {scrambledOops}
          </h2>
        </div>
      </div>

      <p className="z-10 mb-4 text-center text-lg max-w-md text-primary/90">
        Something went wrong at{" "}
        <span className="font-mono text-primary bg-secondary/50 px-2 py-0.5 rounded">
          {location.pathname}
        </span>
        .
      </p>

      <div className="z-10 flex gap-4">
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/10"
        >
          Try Again
        </Button>
        <Link to="/">
          <Button
            variant="default"
            className="backdrop-blur-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ErrorElement
