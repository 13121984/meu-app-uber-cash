import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatsCardProps = {
  title: string
  value: number
  icon: React.ElementType
  isCurrency?: boolean
  unit?: string
  precision?: number
  positive?: boolean
  negative?: boolean
  color?: string
}

export function StatsCard({ title, value, icon: Icon, isCurrency, unit, precision = 0, positive, negative, color }: StatsCardProps) {
  const formattedValue = isCurrency
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : value.toFixed(precision)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn(
          "h-4 w-4 text-muted-foreground",
          positive && "text-green-600",
          negative && "text-red-600",
          color
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          positive && "text-green-600 dark:text-green-500",
          negative && "text-red-600 dark:text-red-500"
        )}>
          {formattedValue} {unit && !isCurrency && <span className="text-base font-normal text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
