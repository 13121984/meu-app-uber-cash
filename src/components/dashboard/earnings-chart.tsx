"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface EarningsPieChartProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
}

const chartConfig = {
  lucro: {
    label: "Lucro",
    color: "hsl(var(--chart-1))",
  },
  combustivel: {
    label: "Combustível",
    color: "hsl(var(--chart-2))",
  },
  extras: {
    label: "Extras",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function EarningsPieChart({ data }: EarningsPieChartProps) {
  const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
              formatter={(value, name, props) => {
                const totalGanho = props.payload.totalGanho;
                if (totalGanho > 0) {
                  return `${(value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${((value as number) / totalGanho * 100).toFixed(1)}%)`
                }
                return `${(value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
              }}
              labelKey="name"
            />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={2}
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

              if ((percent * 100) < 5) return null;

              return (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
