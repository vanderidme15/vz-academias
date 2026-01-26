import type { LucideIcon } from "lucide-react";

export type DialogHandlers = {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openDialogDelete: boolean;
  setOpenDialogDelete: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItem: any;
  setSelectedItem: React.Dispatch<React.SetStateAction<any>>;
  customAction: string | undefined;
  setCustomAction: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'integer'
  | 'price'
  | 'textarea'
  | 'select'
  | 'multiple-select'
  | 'checkbox'
  | 'date'
  | 'color'
  | 'image'
  | 'height'
  | 'radio'
  | 'time'

export interface FieldConfig {
  name: string
  label: string | React.ReactNode
  type: FieldType
  options?: Array<{ label: string | React.ReactNode; value: string }>
  defaultValue?: any
  required: boolean
  className?: string
  placeholder?: string // ⬅️ Útil para inputs
  helpText?: string // ⬅️ Texto de ayuda debajo del campo
  accept?: string // ⬅️ Para tipo 'image': acepta tipos de archivo (ej: "image/*")
  dependsOn?: { // ⬅️ Para mostrar/ocultar campos condicionalmente
    field: string
    value: any
  }
  onChange?: (value: any, setValue: any, getValues: any) => void // ⬅️ Callback cuando cambia el valor
  disabled?: boolean // ⬅️ Para deshabilitar campos
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'decimal' | 'none' // ⬅️ Tipo de teclado en móviles
  pattern?: string // ⬅️ Patrón HTML5 de validación (ej: '[0-9]*')
  maxLength?: number // ⬅️ Longitud máxima del input
}

export interface FormConfig {
  buttonLabel?: string
  buttonSize?: "default" | "cta" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg" | null | undefined
  buttonVariant?: "default" | "cta" | "destructive" | "link" | "outline" | "secondary" | "ghost" | null | undefined
  fields: FieldConfig[]
  schema: any
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  className?: string
  selectedItem?: Record<string, any> | null
}

export interface HandlerResponse {
  success: boolean;
  message?: string;
}

export interface ExtraAction {
  label: string;
  handler: (item: any) => void;
  icon: LucideIcon;
  variant?: 'default' | 'destructive'
}
