import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FieldConfig } from "@/shared/types/ui.types";
import { useState, useEffect } from "react";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldHeight({ fieldConfig, formField }: FormFieldProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sincronizar displayValue con formField.value
  useEffect(() => {
    if (formField.value === undefined || formField.value === null || formField.value === '') {
      setDisplayValue('');
    } else if (!isFocused) {
      // Solo formatear con 'cm' cuando NO está enfocado
      setDisplayValue(`${formField.value}cm`);
    } else {
      // Cuando está enfocado, mostrar solo el número
      setDisplayValue(`${formField.value}`);
    }
  }, [formField.value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remover todo excepto números
    const numbersOnly = value.replace(/[^\d]/g, '');

    // Actualizar el display con solo números
    setDisplayValue(numbersOnly);

    // Si no hay números, limpiar el campo
    if (numbersOnly === '') {
      formField.onChange('');
      return;
    }

    // Convertir a número
    const numValue = parseInt(numbersOnly, 10);

    // Validar rango máximo
    if (numValue > 250) {
      return;
    }

    // Guardar el valor numérico
    formField.onChange(numValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Al enfocar, mostrar solo el número sin 'cm'
    if (formField.value) {
      setDisplayValue(`${formField.value}`);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Al salir, formatear con 'cm'
    if (formField.value && formField.value !== '') {
      setDisplayValue(`${formField.value}cm`);
    }
    formField.onBlur(e);
  };

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          type="text"
          placeholder={fieldConfig.placeholder || "Ej: 170"}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={formField.disabled}
          name={formField.name}
          maxLength={fieldConfig.maxLength}
          pattern={fieldConfig.pattern}
          inputMode={fieldConfig.inputMode}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}