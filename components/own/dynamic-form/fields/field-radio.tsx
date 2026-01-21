import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FieldConfig } from "@/shared/types/ui.types";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

export default function FieldRadio({ fieldConfig, formField }: FormFieldProps) {
  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel>
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={(value) => {
            formField.onChange(value);
            if (fieldConfig.onChange) {
              fieldConfig.onChange(value, formField.onChange, formField);
            }
          }}
          value={formField.value}
          disabled={fieldConfig.disabled || formField.disabled}
          className="w-full flex gap-2"
        >
          {fieldConfig.options?.map((option) => (
            <label
              key={option.value}
              className={`grow flex items-center space-x-3 space-y-0 rounded-md border p-3 ${(fieldConfig.disabled || formField.disabled)
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer hover:bg-accent'
                }`}
            >
              <RadioGroupItem value={option.value} />
              <span className="font-normal flex-1">
                {option.label}
              </span>
            </label>
          ))}
        </RadioGroup>
      </FormControl>
      {fieldConfig.helpText && (
        <FormDescription>{fieldConfig.helpText}</FormDescription>
      )}
    </FormItem>
  );
}