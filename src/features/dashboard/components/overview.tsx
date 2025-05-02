"use client";


import { useAideService } from "@/api/aide/aideService";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { calculateDailyAmounts } from "../data-service";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const chartConfig = {
  restants: {
    label: "Cumul Reste à verser",
    color: "hsl(var(--chart-1))",
  },
};

export function Overview({
  startDate = startOfMonth(new Date()),
  endDate = endOfMonth(new Date())
}: { startDate?: Date, endDate?: Date }) {

  const { aides, loading } = useAideService({
    where: {
      dateAide: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    },
  });

  const chartData = useMemo(() => {
    if (loading || !aides.length) return [];
    return calculateDailyAmounts(aides, startDate, endDate);
  }, [aides, loading, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumul Reste à verser (€)</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-md" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillRestants" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-restants)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-restants)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => format(new Date(value), "dd/MM")}
              />
              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="restantsCumul"
                type="natural"
                fill="url(#fillRestants)"
                stroke="var(--color-restants)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
