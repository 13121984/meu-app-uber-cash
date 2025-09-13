
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { FuelExpense } from "@/services/summary.service"

interface FuelBarChartProps {
  data: FuelExpense[];
}

const chartConfig = {} satisfies ChartConfig

export function FuelBarChart({ data }: FuelBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={10} />
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
          <Bar dataKey="total" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
