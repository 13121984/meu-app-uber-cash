
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { TripsByCategory } from "@/services/summary.service"

interface TripsBarChartProps {
  data: TripsByCategory[];
}

const chartConfig = {} satisfies ChartConfig

export function TripsBarChart({ data }: TripsBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="20%">
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
                formatter={(value, name) => `${value} viagens`}
            />} 
          />
          <Bar dataKey="total" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
