'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import type { FormConfig, FieldConfig } from '@/shared/types/ui.types'
import FieldTextarea from './fields/field-textarea'
import FieldSelect from './fields/field-select'
import FieldCheckbox from './fields/field-checkbox'
import FieldText from './fields/field-text'
import FieldInteger from './fields/field-integer'
import { cn } from '@/lib/utils'
import { getDefaultValueForField } from './get-default-values'
import FieldPassword from './fields/field-password'
import FieldDatePicker from './fields/field-date-picker'
import FieldColor from './fields/field-color'
import FieldImage from './fields/field-image'
import FieldHeight from './fields/field-height'
import FieldRadio from './fields/field-radio'
import FieldMultiSelect from './fields/field-multiple-select'
import FieldTime from './fields/field-time'
import FieldPrice from './fields/field-price'
import { isFieldDisabled, shouldShowField } from './dynamic-form-utils'


export function DynamicForm({
  buttonLabel,
  buttonSize,
  buttonVariant,
  fields,
  schema,
  onSubmit,
  selectedItem = null,
  className
}: FormConfig) {

  const defaultValues = fields.reduce((acc, field) => {
    acc[field.name] = getDefaultValueForField(field, selectedItem);
    return acc;
  }, {} as Record<string, any>);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: defaultValues,
  })

  const onSubmitHandler = async (data: Record<string, any>) => {
    await onSubmit(data)
  }

  const renderField = (fieldConfig: FieldConfig) => {
    // Verificar si el campo debe mostrarse
    if (!shouldShowField(fieldConfig, form)) {
      return null;
    }

    return (
      <FormField
        key={fieldConfig.name}
        control={form.control}
        name={fieldConfig.name}
        render={({ field: formField }) => {
          const handleChange = (value: any) => {
            formField.onChange(value);
            if (fieldConfig.onChange) {
              fieldConfig.onChange(value, form.setValue, form.getValues);
            }
          };

          // Determinar si el campo debe estar deshabilitado
          const isDisabled = isFieldDisabled(fieldConfig, form, formField.disabled);

          const enhancedFormField = {
            ...formField,
            onChange: handleChange,
            disabled: isDisabled
          };

          switch (fieldConfig.type) {
            case 'textarea':
              return <FieldTextarea fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'select':
              return <FieldSelect fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'multiple-select':
              return <FieldMultiSelect fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'radio':
              return <FieldRadio fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'color':
              return <FieldColor fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'checkbox':
              return <FieldCheckbox fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'integer':
              return <FieldInteger fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'password':
              return <FieldPassword fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'date':
              return <FieldDatePicker fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'image':
              return <FieldImage fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'height':
              return <FieldHeight fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'time':
              return <FieldTime fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'price':
              return <FieldPrice fieldConfig={fieldConfig} formField={enhancedFormField} />
            case 'email':
            case 'text':
            default:
              return <FieldText fieldConfig={fieldConfig} formField={enhancedFormField} />
          }
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className={cn("w-full grid gap-2 grid-cols-1 h-full overflow-y-auto px-1 relative", className)} noValidate>
        {fields.map((field) => renderField(field))}

        <div className="w-full col-span-full sticky bottom-0 bg-card">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
            className="w-full col-span-full"
            size={buttonSize}
            variant={buttonVariant}
          >
            {form.formState.isSubmitting ? 'Cargando...' : buttonLabel ? buttonLabel : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}