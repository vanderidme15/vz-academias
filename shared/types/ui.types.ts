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
  | 'date-range'
  | 'color'
  | 'image'
  | 'file'
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
    value?: any // value es opcional para casos donde solo importa si existe
  }
  disabledWhen?: { // ⬅️ NUEVO: Para deshabilitar campos condicionalmente
    field: string
    value?: any // Si no se especifica, se deshabilita cuando el campo dependiente esté vacío
  }
  onChange?: (value: any, setValue: any, getValues: any) => void // ⬅️ Callback cuando cambia el valor
  disabled?: boolean // ⬅️ Para deshabilitar campos de forma estática
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

// Cosas para el check-in
// ========================================
// 📁 types/check-in.types.ts
// ========================================
export interface CheckInEntity {
  id?: string
  name?: string
  dni?: string
  age?: number
  is_under_18?: boolean
  cellphone_number?: string
  payment_method?: 'yape' | 'efectivo'
  payment_recipe_url?: string
  payment_checked?: boolean
  parent_name?: string
  parent_cellphone_number?: string
  terms_accepted?: boolean
  is_active?: boolean
  register_by?: string
  check_in?: boolean
  created_at?: string
  updated_at?: string
}

export type CheckInType = 'inscripcion' | 'voluntario'

export interface CheckInConfig<T extends CheckInEntity> {
  type: CheckInType
  fetchById: (id: string) => Promise<T | null>
  handleCheckIn: (id: string) => Promise<void>
  getExtraFields?: (entity: T) => React.ReactNode
}



export type HorarioKey = string

export interface HorarioOption {
  key: HorarioKey
  days: string[]
  start_time: string
  end_time: string
  label: string
}
