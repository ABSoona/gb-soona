"use client";

import { useMemo, useState } from "react";
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear, subMonths, subYears,parse } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useVersementService } from "@/api/versement/versementService";
import { Versement } from "@/model/versement/versement";
import { ChartVersement } from "./chart-versements";
import { fr } from "date-fns/locale";

const chartConfig = {
  restants: {
    label: "Cumul Reste à verser",
    color: "hsl(var(--chart-1))",
  },
};

export function Overview() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [activePeriod, setActivePeriod] = useState<
    "mois" | "moisPrecedent" | "annee" | "anneePrecedente" | "custom"
  >("mois");
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handlePeriodChange = (period: typeof activePeriod) => {
    setActivePeriod(period);

    switch (period) {
      case "mois":
        setShowCustomPicker(false);
        setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
        break;
      case "moisPrecedent":
        setShowCustomPicker(false);
        const prevMonth = subMonths(new Date(), 1);
        setDateRange({ from: startOfMonth(prevMonth), to: endOfMonth(prevMonth) });
        break;
      case "annee":
        setShowCustomPicker(false);
        setDateRange({ from: startOfYear(new Date()), to: endOfYear(new Date()) });
        break;
      case "anneePrecedente":
        setShowCustomPicker(false);
        const prevYear = subYears(new Date(), 1);
        setDateRange({ from: startOfYear(prevYear), to: endOfYear(prevYear) });
        break;
      case "custom":
        setShowCustomPicker(true);
        break;
    }
  };

  const { versements, loading } = useVersementService({
    where: {
      dataVersement: {
        gte: dateRange.from?.toISOString(),
        lte: dateRange.to?.toISOString(),
      },
    },
  });

  const chartData = useMemo(() => {
    if (loading || !versements.length || !dateRange.from || !dateRange.to) return [];
  
    const diffInMonths =
      dateRange.to.getFullYear() * 12 + dateRange.to.getMonth() -
      (dateRange.from.getFullYear() * 12 + dateRange.from.getMonth());
  
    const groupBy = diffInMonths > 6 ? "month" : "day";
  
    const map = new Map<string, number>();
  
    versements.forEach((v: Versement) => {
      const date = new Date(v.dataVersement);
      const dateKey = groupBy === "month"
        ? format(date, "yyyy-MM")
        : format(date, "dd/MM");
  
      const previous = map.get(dateKey) || 0;
      map.set(dateKey, previous + v.montant);
    });
  
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, versement]) => {
        let dateLabel = key;
        if (groupBy === "month") {
          const parsedDate = parse(key + "-01", "yyyy-MM-dd", new Date());
          dateLabel = format(parsedDate, "MMMM yyyy", { locale: fr }); // Ex : "février 2025"
        }
        return {
          date: dateLabel,
          versement,
        };
      });
  }, [versements, loading, dateRange]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={activePeriod === "mois" ? "default" : "outline"} onClick={() => handlePeriodChange("mois")}>
            Mois
          </Button>
          <Button size="sm" variant={activePeriod === "moisPrecedent" ? "default" : "outline"} onClick={() => handlePeriodChange("moisPrecedent")}>
            Mois-1
          </Button>
          <Button size="sm" variant={activePeriod === "annee" ? "default" : "outline"} onClick={() => handlePeriodChange("annee")}>
            Année
          </Button>
          <Button size="sm" variant={activePeriod === "anneePrecedente" ? "default" : "outline"} onClick={() => handlePeriodChange("anneePrecedente")}>
            Année-1
          </Button>
          <Button size="sm" variant={activePeriod === "custom" ? "default" : "outline"} onClick={() => handlePeriodChange("custom")}>
            Personnalisé
          </Button>
        </div>

        {showCustomPicker && (
          <DatePickerWithRange
            value={dateRange}
            onChange={(newRange) => {
              if (newRange?.from && newRange?.to) {
                setDateRange(newRange);
              }
            }}
          />
        )}
      </div>

      {loading ? (
        <Skeleton className="h-[250px] w-full rounded-md" />
      ) : (
        <ChartVersement chartData={chartData} />
      )}
    </>
  );
}
