import { useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldDatePicker({ fieldConfig, formField }: FormFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <FormItem className={cn("flex flex-col", fieldConfig.className)}>
      <FormLabel className="w-fit">
        {fieldConfig.label}{" "}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !formField.value && "text-muted-foreground"
              )}
            >
              {formField.value ? (
                format(formField.value, "PPP", { locale: es })
              ) : (
                <span>Selecciona una fecha</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formField.value}
            onSelect={(date) => {
              formField.onChange(date);
              setOpen(false);
            }}
            disabled={(date) =>
              date < new Date("1900-01-01")
            }
            locale={es}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
