
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatsCardProps = {
  title: string
  value: number
  subtitle: string
  icon: React.ElementType
  isCurrency?: boolean
  unit?: string
  precision?: number
  iconBg?: string
  iconColor?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, isCurrency, unit, precision = 0, iconBg, iconColor }: StatsCardProps) {
  const formattedValue = isCurrency
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: precision, maximumFractionDigits: precision })
    : `${value.toFixed(precision)}${unit ? ` ${unit}`: ''}`

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
            <p className="text-2xl font-bold">{formattedValue}</p>
            <p className="text-sm text-muted-foreground">{title}{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}
