import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/shared/types/ui.types";
import type { DateRange } from "react-day-picker";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldDateRangePicker({ fieldConfig, formField }: FormFieldProps) {
  const dateRange = formField.value as DateRange | undefined;

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return "Selecciona un rango de fechas";
    }

    if (!range.to) {
      return format(range.from, "dd/MM/yyyy", { locale: es });
    }

    return `${format(range.from, "dd/MM/yyyy", { locale: es })} - ${format(range.to, "dd/MM/yyyy", { locale: es })}`;
  };

  return (
    <FormItem className={cn("flex flex-col", fieldConfig.className)}>
      <FormLabel className="w-fit">
        {fieldConfig.label}{" "}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              {formatDateRange(dateRange)}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={formField.onChange}
            disabled={(date) =>
              date < new Date("1900-01-01")
            }
            locale={es}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}