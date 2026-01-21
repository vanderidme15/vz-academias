import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig,
  formField: any,
}

export default function FieldText({ fieldConfig, formField }: FormFieldProps) {
  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          {...formField}
          value={formField.value || ''}
          placeholder={fieldConfig.placeholder}
          disabled={fieldConfig.disabled}
          inputMode={fieldConfig.inputMode}
          pattern={fieldConfig.pattern}
          maxLength={fieldConfig.maxLength}
        />
      </FormControl>
      <FormMessage />
      {fieldConfig.helpText && (
        <p className="text-sm text-muted-foreground mt-1">
          {fieldConfig.helpText}
        </p>
      )}
    </FormItem>
  );
}