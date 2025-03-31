import { useDemandeService } from '@/api/demande/demandeService';
import { Demande } from '@/model/demande/Demande';
import { endOfMonth, startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { Pie, PieChart } from 'recharts';


import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

import { demandeStatusTypes } from '@/features/demandes/data/data';

interface StatusDemandesProps {
  dateRange?: { from: Date; to: Date };
}

const CHART_COLORS = [
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--chart-6',
  '--chart-7',
  '--chart-8',
];

export function StatusDemandes({ dateRange }: StatusDemandesProps) {
  const range = dateRange ?? {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  };

  const variables = useMemo(() => {
    return {
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
      },
    };
  }, [range]);

  const { demandes, loading } = useDemandeService(variables);

  const chartData = useMemo(() => {
    if (loading) return [];

    const statusMap: Record<string, number> = {};

    demandes.forEach((demande: Demande) => {
      const status = demande.status || 'inconnu';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([status, count], index) => {
      const statusLabel =
        demandeStatusTypes.find((s) => s.value === status)?.label || status;
      return {
        status: statusLabel,
        value: count,
        fill: `hsl(var(${CHART_COLORS[index % CHART_COLORS.length]}))`,
      };
    });
  }, [demandes, loading]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((item) => {
      config[item.status] = {
        label: item.status,
        color: item.fill,
      };
    });
    return { visitors: { label: 'Statuts' }, ...config };
  }, [chartData]);

  return (
    <div>
      
        {loading ? (
          <Skeleton className="mx-auto aspect-square max-h-[250px]  rounded-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={chartData} dataKey="value" nameKey="status" />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap gap-4 [&>*]:basis-1/4 [&>*]:justify-center text-nowrap"
              />
            </PieChart>
          </ChartContainer>
        )}
      
    </div>
  );
}
