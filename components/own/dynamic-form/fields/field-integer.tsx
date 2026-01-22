import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldInteger({ fieldConfig, formField }: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir campo vacío
    if (value === '') {
      formField.onChange('');
      return;
    }

    // Convertir a número si es un valor válido
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      formField.onChange(numValue);
    }
  };

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder={fieldConfig.placeholder}
          value={formField.value === undefined || formField.value === null ? '' : formField.value}
          onChange={handleChange}
          onBlur={formField.onBlur}
          disabled={formField.disabled}
          name={formField.name}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
