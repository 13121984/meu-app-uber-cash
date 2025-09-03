
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
}

export function StatsCard({ title, value, icon: Icon, isCurrency, unit, precision = 0, iconBg, iconColor }: StatsCardProps) {
  const formattedValue = isCurrency
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: precision, maximumFractionDigits: precision })
    : `${value.toFixed(precision)}${unit ? ` ${unit}`: ''}`

  return (
    <Card className="bg-secondary/50 border-border p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
             <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div>
                 <p className="text-xl font-bold">{formattedValue}</p>
            </div>
        </div>
        <p className="text-sm text-muted-foreground ml-1">{title}</p>
    </Card>
  )
}
