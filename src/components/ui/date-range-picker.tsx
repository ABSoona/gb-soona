import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  value?: DateRange; // ✅ Ajout pour permettre un contrôle externe
  onChange: (dateRange: DateRange | undefined) => void;
}

export function DatePickerWithRange({ value, onChange }: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  // 🔥 Met à jour l'état local si `value` change (ex: lors de la réinitialisation)
  React.useEffect(() => {
    setDate(value);
  }, [value]);

  React.useEffect(() => {
    onChange(date);
  }, [date]);

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd LLL y")} - {format(date.to, "dd LLL y")}
                </>
              ) : (
                format(date.from, "dd LLL y")
              )
            ) : (
              <span>Choisir une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
