
import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldColorCombobox({ fieldConfig, formField }: FormFieldProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState(0);

  const value =
    formField.value !== undefined && formField.value !== null && formField.value !== ''
      ? formField.value
      : fieldConfig.defaultValue || '';

  const selectedOption = fieldConfig.options?.find((option) => option.value === value);

  React.useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label} {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              ref={triggerRef}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {value ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: value }}
                  />
                  <span className="truncate">{selectedOption?.label || value}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Selecciona un color</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: triggerWidth }}
        >
          <Command>
            <CommandInput placeholder="Buscar color..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontró ningún color.</CommandEmpty>
              <CommandGroup>
                <div className="grid grid-cols-3 gap-2 p-2">
                  {fieldConfig.options?.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        formField.onChange(option.value);
                        setOpen(false);
                      }}
                      className="cursor-pointer p-3 aria-selected:bg-accent"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm shrink-0"
                          style={{ backgroundColor: option.value }}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-sm truncate">{option.label}</span>
                        </div>
                        {value === option.value && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  );
}