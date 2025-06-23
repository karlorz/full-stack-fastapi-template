import { Link, useRouterState } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { useTextScramble } from "@/hooks/useTextScramble"

const NotFound = () => {
  const { location } = useRouterState()
  const { text: scrambledOops } = useTextScramble("Oops!", 450)
  const { text: scrambled404 } = useTextScramble("404", 900)

  return (
    <div
      className="relative flex h-screen flex-col items-center justify-center p-4 text-primary dark:text-muted-foreground overflow-hidden bg-gradient-to-br from-background to-secondary"
      data-testid="not-found"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />

      <div className="z-10 flex items-center">
        <div className="flex flex-col items-center justify-center p-4">
          <h1 className="relative mb-4 text-[6rem] font-bold leading-none md:text-[8rem] font-mono text-primary cursor-pointer">
            {scrambled404}
            <span className="absolute -inset-0.5 text-primary/20">
              {scrambled404}
            </span>
          </h1>
          <h2 className="mb-2 text-2xl font-bold font-mono text-primary cursor-pointer">
            {scrambledOops}
          </h2>
        </div>
      </div>

      <p className="z-10 mb-4 text-center text-lg max-w-md text-primary/90 dark:text-muted-foreground">
        The page you are looking for at{" "}
        <span className="font-mono text-primary bg-secondary/50 px-2 py-0.5 rounded">
          {location.pathname}
        </span>{" "}
        was not found.
      </p>

      <div className="z-10">
        <Link to="/">
          <Button
            variant="default"
            className="mt-4 backdrop-blur-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go Back
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
