import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { fr } from "date-fns/locale/fr"

interface DatePickerWithRangeProps {
  value?: DateRange; // ✅ Ajout pour permettre un contrôle externe
  onChange: (dateRange: DateRange | undefined) => void;
  placeholder?: String;
}

export function DatePickerWithRange({ value, onChange,placeholder }: DatePickerWithRangeProps) {
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
              "h-8 w-[150px] lg:w-[250px] justify-start text-left font-normal",
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
              placeholder ? placeholder: <span>Choisir une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            locale={fr}
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
