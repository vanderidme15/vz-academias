import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldMultiSelect({ fieldConfig, formField }: FormFieldProps) {
  const selectedValues = Array.isArray(formField.value) ? formField.value : [];

  const handleSelect = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((value: any) => value !== optionValue)
      : [...selectedValues, optionValue];

    formField.onChange(newValues);
  };

  const handleRemove = (optionValue: string) => {
    const newValues = selectedValues.filter((value: any) => value !== optionValue);
    formField.onChange(newValues);
  };

  const getSelectedLabels = () => {
    return selectedValues
      .map((value: any) => fieldConfig.options?.find((opt: any) => opt.value === value)?.label)
      .filter(Boolean);
  };

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label} {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>

      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between font-normal",
                selectedValues.length === 0 && "text-muted-foreground"
              )}
            >
              <div className="flex gap-1 flex-wrap">
                {selectedValues.length === 0 ? (
                  <span>Selecciona opciones</span>
                ) : (
                  getSelectedLabels().map((label: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        const value = selectedValues[index];
                        handleRemove(value);
                      }}
                    >
                      {label}
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                  ))
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar..." />
            <CommandEmpty>No se encontraron opciones.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {fieldConfig.options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  );
}