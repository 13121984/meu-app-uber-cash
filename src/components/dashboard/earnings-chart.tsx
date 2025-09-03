"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartData = [
  { date: "Seg", earnings: 186, expenses: 80 },
  { date: "Ter", earnings: 305, expenses: 200 },
  { date: "Qua", earnings: 237, expenses: 120 },
  { date: "Qui", earnings: 173, expenses: 190 },
  { date: "Sex", earnings: 209, expenses: 130 },
  { date: "Sab", earnings: 214, expenses: 140 },
  { date: "Dom", earnings: 350, expenses: 50 },
]

const chartConfig = {
  earnings: {
    label: "Ganhos",
    color: "hsl(var(--primary))",
  },
  expenses: {
    label: "Despesas",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export function EarningsChart() {
  return (
    <div className="h-[350px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="earnings" fill="var(--color-earnings)" name="Ganhos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" name="Despesas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
