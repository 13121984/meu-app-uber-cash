
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { EarningsByCategory } from "./dashboard-client"

interface EarningsBarChartProps {
  data: EarningsByCategory[];
}

const chartConfig = {} satisfies ChartConfig

export function EarningsBarChart({ data }: EarningsBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="20%">
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis 
            tickFormatter={(value) => `R$${value}`}
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
            width={80}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
                formatter={(value) => (value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            />} 
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
