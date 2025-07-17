import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import logo from "../../assets/logo.svg"

interface AuthCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  showLogo?: boolean
  footer?: React.ReactNode
}

const AuthCard = ({
  children,
  title,
  description,
  showLogo = true,
  footer,
}: AuthCardProps) => (
  <Card className="w-full max-w-md border border-black/5 dark:border-white/5 shadow-lg shadow-black/[0.03] dark:shadow-black/30 bg-white dark:bg-zinc-900">
    {(showLogo || title || description) && (
      <CardHeader className="pb-4 md:pb-6 px-6 md:px-8">
        {showLogo && (
          <a href="/" className="flex justify-center py-8">
            <img
              src={logo}
              alt="FastAPI Cloud"
              className="h-8 w-auto dark:invert-0 invert"
            />
          </a>
        )}
        {title && (
          <CardTitle className="font-heading text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </CardTitle>
        )}
        {description && (
          <CardDescription className="font-body text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
    )}
    <CardContent className="pt-0 pb-6 md:pb-8 px-6 md:px-8 text-sm text-foreground">
      {children}
    </CardContent>
    {footer}
  </Card>
)

export default AuthCard
