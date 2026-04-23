import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  variant?: "default" | "primary" | "success" | "warning" | "destructive"
}

const variantStyles = {
  default: "bg-card border-border",
  primary: "bg-primary/10 border-primary/20",
  success: "bg-emerald-500/10 border-emerald-500/20",
  warning: "bg-amber-500/10 border-amber-500/20",
  destructive: "bg-destructive/10 border-destructive/20",
}

const iconVariantStyles = {
  default: "bg-secondary text-muted-foreground",
  primary: "bg-primary/20 text-primary",
  success: "bg-emerald-500/20 text-emerald-500",
  warning: "bg-amber-500/20 text-amber-500",
  destructive: "bg-destructive/20 text-destructive",
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-colors",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconVariantStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {trend && (
          <span
            className={cn(
              "mb-1 text-sm font-medium",
              trend.positive ? "text-emerald-500" : "text-destructive"
            )}
          >
            {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  )
}
