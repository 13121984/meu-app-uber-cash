
"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface EarningsPieChartProps {
  data: {
    name: string;
    value: number;
    fill: string;
    totalGanho: number;
  }[];
}

const chartConfig = {
  lucro: {
    label: "Lucro Líquido",
    color: "hsl(var(--chart-1))",
  },
  combustivel: {
    label: "Combustível",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function EarningsPieChart({ data }: EarningsPieChartProps) {
  const totalGanho = data[0]?.totalGanho || 0;
  
  // O gráfico agora é baseado no Ganho Bruto, não na soma das partes
  const chartData = data.map(item => ({
    ...item,
    // O valor de cada fatia continua o mesmo, mas o percentual será calculado sobre o totalGanho
  }));


  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
              formatter={(value, name, props) => {
                const totalGanhoBruto = props.payload?.totalGanho;
                if (totalGanhoBruto > 0) {
                  return `${(value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${((value as number) / totalGanhoBruto * 100).toFixed(1)}%)`
                }
                return `${(value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
              }}
              labelKey="name"
            />}
          />
          <Pie
            data={chartData}
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

              if (totalGanho <= 0) return null;
              
              const currentPercent = (data[index].value / totalGanho) * 100;

              if (currentPercent < 5) return null;

              return (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                  {`${currentPercent.toFixed(0)}%`}
                </text>
              );
            }}
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
