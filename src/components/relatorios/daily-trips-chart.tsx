
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { DailyTripsData } from "@/services/work-day.service"

interface DailyTripsChartProps {
  data: DailyTripsData[];
}

const chartConfig = {
  viagens: {
    label: "Viagens",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function DailyTripsChart({ data }: DailyTripsChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart 
            data={data} 
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            barCategoryGap="20%"
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
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
            allowDecimals={false}
            fontSize={12}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
                formatter={(value, name) => [`${value} viagens`, "Total de Viagens"]}
                labelFormatter={(label) => `Data: ${label}`}
            />} 
          />
          <Bar dataKey="viagens" fill="var(--color-viagens)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
