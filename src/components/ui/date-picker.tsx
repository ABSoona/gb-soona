import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { fr } from 'date-fns/locale'

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date?: Date) => void;
  className?: string; // ✅ ajout de className ici
}
export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className 
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toLocaleDateString('fr-FR') : <span>Choisir une date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          locale={fr}
          
          captionLayout="dropdown"
          fromYear={1900}   // 👈 début de la plage
          toYear={2030}   
            // 👈 fin de la plage
          mode="single"
          selected={date}
          onSelect={onDateChange}  // ✅ Correction ici
          initialFocus        
          disabled={false}
        />
      </PopoverContent>
    </Popover>
  );
}
