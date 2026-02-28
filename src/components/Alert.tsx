import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  LucideIcon,
} from "lucide-react"



export type AlertVariant = "error" | "warning" | "info" | "success"

type AlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  title?: string
  message: React.ReactNode

  variant?: AlertVariant

  // Texte du bouton "Fermer"
  closeText?: string

  // Si tu veux forcer une icône custom (sinon ça dépend de variant)
  icon?: LucideIcon

  // Classes optionnelles
  className?: string
}

const variantStyles: Record<AlertVariant, { icon: LucideIcon; iconClass: string }> = {
  error: { icon: XCircle, iconClass: "text-destructive" },
  warning: { icon: AlertTriangle, iconClass: "text-yellow-600 dark:text-yellow-500" },
  info: { icon: Info, iconClass: "text-blue-600 dark:text-blue-500" },
  success: { icon: CheckCircle2, iconClass: "text-green-600 dark:text-green-500" },
}

export function Alert({
  open,
  onOpenChange,
  title = "Information",
  message,
  variant = "info",
  closeText = "Fermer",
  icon,
  className,
}: AlertProps) {
  const config = variantStyles[variant]
  const Icon = icon ?? config.icon

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("sm:max-w-md", className)}>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClass)} />
            <div className="space-y-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{message}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {closeText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



type OpenAlertParams = {
  title?: string
  message: React.ReactNode
  variant?: AlertVariant
  closeText?: string
}

export function useAlert() {
  const [open, setOpen] = React.useState(false)
  const [params, setParams] = React.useState<OpenAlertParams>({
    title: "Information",
    message: "",
    variant: "info",
    closeText: "Fermer",
  })

  const openAlert = (p: OpenAlertParams) => {
    setParams({
      title: p.title ?? "Information",
      message: p.message,
      variant: p.variant ?? "info",
      closeText: p.closeText ?? "Fermer",
    })
    setOpen(true)
  }

  const AlertNode = (
    <Alert
      open={open}
      onOpenChange={setOpen}
      title={params.title}
      message={params.message}
      variant={params.variant}
      closeText={params.closeText}
    />
  )

  return { openAlert, AlertNode }
}