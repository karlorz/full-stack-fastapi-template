import { Link, useRouterState } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

const NotFound = () => {
  const { location } = useRouterState()

  return (
    <div
      className="flex h-screen flex-col items-center justify-center p-4 text-muted-foreground"
      data-testid="not-found"
    >
      <div className="z-10 flex items-center">
        <div className="flex flex-col items-center justify-center p-4">
          <h1 className="mb-4 text-[6rem] font-bold leading-none md:text-[8rem]">
            404
          </h1>
          <h2 className="mb-2 text-2xl font-bold">Oops!</h2>
        </div>
      </div>
      <p className="z-10 mb-4 text-center text-lg">
        The page you are looking for at <span>{location.pathname}</span> was not
        found.
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

export default NotFound
