
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { AverageEarningByCategory } from "@/services/work-day.service"

interface AverageEarningPerTripChartProps {
  data: AverageEarningByCategory[];
}

const chartConfig = {} satisfies ChartConfig

export function AverageEarningPerTripChart({ data }: AverageEarningPerTripChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart 
            data={data} 
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }} 
            layout="vertical"
            barCategoryGap="20%"
        >
          <YAxis 
            dataKey="name" 
            type="category"
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
            width={80}
          />
          <XAxis 
            type="number"
            tickFormatter={(value) => `R$${value.toFixed(2)}`}
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
                formatter={(value) => (value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            />} 
          />
          <Bar dataKey="average" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
