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

  const formattedValue = isPreview 
    ? title 
    : isValidNumber
      ? isCurrency
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: precision, maximumFractionDigits: precision })
        : `${value.toFixed(precision)}${unit ? `${unit}`: ''}`
      : isCurrency ? (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "—";


  const description = isPreview ? '' : title;

  return (
    <Card className="p-4 bg-secondary">
      <CardContent className="flex flex-col items-start gap-2 p-0">
        {Icon && 
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
                <Icon className={cn("h-5 w-5 text-white", iconColor)} />
            </div>
        }
        <div className="flex flex-col">
          <p className="text-xl font-bold truncate">{formattedValue}</p>
          {description && (
             <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
