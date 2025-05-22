"use client";



import { endOfMonth, format, startOfMonth } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useVersementService } from "@/api/versement/versementService";
import { Versement } from "@/model/versement/versement";
import { ChartVersement } from "./chart-versements";

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


  const {versements,loading} = useVersementService({
    where: {
      dataVersement: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    },
  })
  const chartData = useMemo(() => {
    if (loading || !versements.length) return [];
  
    const map = new Map<string, number>();
  
    versements.forEach((v: Versement) => {
      const dateKey = format(new Date(v.dataVersement), 'yyyy-MM-dd');
      const previous = map.get(dateKey) || 0;
      map.set(dateKey, previous + v.montant);
    });
  
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, versement]) => ({
        date,
        versement,
      }));
  }, [versements, loading, startDate, endDate]);
  return (
    <>

        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-md" />
        ) : (
        <ChartVersement chartData={chartData}/>
          )}
  
    </>
  );
}
