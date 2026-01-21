import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldTime({ fieldConfig, formField }: FormFieldProps) {
  const value = formField.value || fieldConfig.defaultValue || '';

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formField.onChange(e.target.value);
  };

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label} {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>

      <FormControl>
        <Input
          type="time"
          value={value}
          onChange={handleTimeChange}
          className="w-full"
          placeholder={fieldConfig.placeholder || "Selecciona una hora"}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}