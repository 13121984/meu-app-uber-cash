
"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { ProfitEvolutionData } from "@/services/work-day.service"

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
        <AreaChart 
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="fillLucro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-lucro)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-lucro)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
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
          <Area 
            dataKey="lucro" 
            type="monotone" 
            fill="url(#fillLucro)" 
            stroke="var(--color-lucro)" 
            stackId="1" 
            strokeWidth={2}
            />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
