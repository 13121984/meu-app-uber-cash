

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatsCardProps = {
  title: string
  value: number
  icon: React.ElementType
  isCurrency?: boolean
  unit?: string
  precision?: number
  iconBg?: string
  iconColor?: string
  isPreview?: boolean // New prop
}

export function StatsCard({ title, value, icon: Icon, isCurrency, unit, precision = 0, iconBg, iconColor, isPreview = false }: StatsCardProps) {
  const isValidNumber = typeof value === 'number' && !isNaN(value);

  // If it's a preview, don't show the value. Otherwise, format it.
  const formattedValue = isPreview 
    ? title // In preview, show the title in place of the value for clarity
    : isValidNumber
      ? isCurrency
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: precision, maximumFractionDigits: precision })
        : `${value.toFixed(precision)}${unit ? ` ${unit}`: ''}`
      : "—";

  const description = isPreview ? '' : title;

  return (
    <Card className="p-4">
      <CardContent className="flex items-center gap-4 p-0">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="flex flex-col">
          <p className="text-xl font-bold">{formattedValue}</p>
          {description && (
             <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
