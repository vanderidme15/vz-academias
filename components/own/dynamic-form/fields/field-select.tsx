import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig,
  formField: any,
}

export default function FieldSelect({ fieldConfig, formField }: FormFieldProps) {
  const value =
    formField.value !== undefined && formField.value !== null && formField.value !== ''
      ? formField.value
      : fieldConfig.defaultValue || ''; // <- valor por defecto

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel className="w-fit">
        {fieldConfig.label} {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>

      <Select
        onValueChange={formField.onChange}
        value={value}
      >
        <FormControl>
          <SelectTrigger className="w-full text-left">
            <SelectValue placeholder={'Selecciona una opción'} />
          </SelectTrigger>
        </FormControl>

        <SelectContent>
          {fieldConfig.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FormMessage />
    </FormItem>
  );
}
