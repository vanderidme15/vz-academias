import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldCheckbox({ fieldConfig, formField }: FormFieldProps) {
  return (
    <FormItem className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ${fieldConfig.className}`}>
      <FormControl>
        <Checkbox
          checked={formField.value}
          onCheckedChange={formField.onChange}
          disabled={formField.disabled}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel className={formField.disabled ? 'opacity-60' : ''}>
          {fieldConfig.label}
          {fieldConfig.required && <span className="text-red-400">*</span>}
        </FormLabel>
        {fieldConfig.helpText && (
          <FormDescription>{fieldConfig.helpText}</FormDescription>
        )}
      </div>
    </FormItem>
  );
}