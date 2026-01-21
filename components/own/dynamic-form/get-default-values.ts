import type { FieldConfig } from "@/shared/types/ui.types";

export function getDefaultValueForField (field: FieldConfig, selectedItem: Record<string, any> | null) {
  // Si el campo tiene un defaultValue definido, usarlo, de lo contrario usar el valor base del tipo
  if (selectedItem && selectedItem[field.name] !== undefined && selectedItem[field.name] !== null) {
    return selectedItem[field.name];
  }

  if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
    return field.defaultValue;
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'textarea':
      return '';
    case 'integer':
    case 'select':
      return null;
    case 'checkbox':
      return false;
    default:
      return '';
  }
};
