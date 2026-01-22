import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldPrice({ fieldConfig, formField }: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Permitir campo vacío
    if (inputValue === '') {
      formField.onChange('');
      return;
    }

    // Permitir solo números y punto decimal
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (!regex.test(inputValue)) return;

    // Limitar a 2 decimales
    const parts = inputValue.split('.');
    if (parts[1] && parts[1].length > 2) return;

    // Guardar el valor como string mientras se escribe
    // Esto permite mantener el punto decimal mientras el usuario escribe
    formField.onChange(inputValue);
  };

  const handleBlur = () => {
    // Al perder el foco, convertir a número y redondear a 2 decimales
    if (formField.value !== '' && formField.value !== null && formField.value !== undefined) {
      const numValue = typeof formField.value === 'string'
        ? parseFloat(formField.value)
        : formField.value;

      if (!isNaN(numValue)) {
        formField.onChange(parseFloat(numValue.toFixed(2)));
      } else {
        // Si no es un número válido, limpiar el campo
        formField.onChange('');
      }
    }
    formField.onBlur();
  };

  const displayValue = formField.value === undefined || formField.value === null || formField.value === ''
    ? ''
    : formField.value.toString();

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            S/
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={fieldConfig.placeholder || "0.00"}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={formField.disabled}
            name={formField.name}
            className="pl-10"
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
