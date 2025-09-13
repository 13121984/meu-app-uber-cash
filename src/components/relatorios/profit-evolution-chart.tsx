
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { ProfitEvolutionData } from "@/services/summary.service"

interface ProfitEvolutionChartProps {
  data: ProfitEvolutionData[];
}

const chartConfig = {
  lucro: {
    label: "Lucro",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ProfitEvolutionChart({ data }: ProfitEvolutionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart 
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10} 
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={(value) => `R$${value}`}
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
            width={80}
            fontSize={12}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
                formatter={(value, name) => [
                    (value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    "Lucro"
                ]}
                labelFormatter={(label) => `Data: ${label}`}
            />} 
          />
          <Bar 
            dataKey="lucro" 
            fill="var(--color-lucro)" 
            radius={[4, 4, 0, 0]}
            />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
