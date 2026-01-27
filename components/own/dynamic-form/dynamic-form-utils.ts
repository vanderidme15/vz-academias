import type { FieldConfig } from '@/shared/types/ui.types'
import type { UseFormReturn } from 'react-hook-form'

/**
 * Determina si un campo debe mostrarse basado en sus dependencias
 */
export const shouldShowField = (
  fieldConfig: FieldConfig,
  form: UseFormReturn<any>
): boolean => {
  if (!fieldConfig.dependsOn) return true

  const dependentValue = form.watch(fieldConfig.dependsOn.field)

  // Si value es undefined, verifica solo que exista un valor (truthy)
  if (fieldConfig.dependsOn.value === undefined) {
    return !!dependentValue
  }

  // Si tiene un valor específico, verifica que coincida exactamente
  return dependentValue === fieldConfig.dependsOn.value
}

/**
 * Determina si un campo debe estar deshabilitado basado en sus dependencias
 * Similar a shouldShowField pero para el estado disabled
 */
export const shouldDisableField = (
  fieldConfig: FieldConfig,
  form: UseFormReturn<any>
): boolean => {
  // Si el campo ya tiene disabled explícito, respetarlo
  if (fieldConfig.disabled !== undefined) {
    return fieldConfig.disabled
  }

  // Si tiene una configuración de disabledWhen, evaluarla
  if (fieldConfig.disabledWhen) {
    const dependentValue = form.watch(fieldConfig.disabledWhen.field)

    // Si value es undefined, deshabilitar cuando NO exista un valor
    if (fieldConfig.disabledWhen.value === undefined) {
      return !dependentValue
    }

    // Si tiene un valor específico, deshabilitar cuando NO coincida
    return dependentValue !== fieldConfig.disabledWhen.value
  }

  return false
}

/**
 * Determina si un campo debe estar deshabilitado
 * Combina la lógica de disabled explícito, disabledWhen y el estado del formField
 */
export const isFieldDisabled = (
  fieldConfig: FieldConfig,
  form: UseFormReturn<any>,
  formFieldDisabled?: boolean
): boolean => {
  return shouldDisableField(fieldConfig, form) || !!formFieldDisabled
}