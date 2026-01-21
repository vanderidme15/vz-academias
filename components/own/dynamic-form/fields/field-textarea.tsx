import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig,
  formField: any,
}

export default function FieldTextarea({ fieldConfig, formField }: FormFieldProps) {
  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>{fieldConfig.label} {fieldConfig.required && <span className="text-red-400">*</span>}</FormLabel>
      <FormControl>
        <Textarea
          {...formField}
          value={formField.value || ''}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}