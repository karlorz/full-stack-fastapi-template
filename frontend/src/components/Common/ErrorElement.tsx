import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

const ErrorElement = () => {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center p-4 text-muted-foreground"
      data-testid="not-found"
    >
      <div className="z-10 flex items-center">
        <div className="flex flex-col items-center justify-center p-4">
          <h2 className="mb-2 text-2xl font-bold">Oops!</h2>
        </div>
      </div>

      <p className="z-10 mb-4 text-center text-lg">
        The page you are looking for was not found.
      </p>

      <div className="z-10">
        <Link to="/">
          <Button variant="default" className="mt-4">
            Go Back
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ErrorElement
