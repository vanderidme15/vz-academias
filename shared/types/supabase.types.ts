export type Alumno = {
  id?: string;
  name?: string;
  dni?: string;
  age?: number;
  is_under_18?: boolean;
  gender?: 'varon' | 'dama';
  cellphone?: string;
  parent_name?: string;
  parent_cellphone?: string;
  terms_accepted?: boolean;
  register_by?: string;
  observations?: string;
  created_at?: string;
  updated_at?: string;
}

export type Inscripcion = {
  id?: string;
  student_id?: string;
  student?: Alumno;
  course_id?: string;
  course?: Curso;
  payments?: Pago[];
  assistances?: Asistencia[];
  price_charged?: number;
  includes_registration?: boolean;
  register_by?: string;
  created_at?: string;
  updated_at?: string;
}

export type Curso = {
  id?: string;
  name?: string;
  description?: string;
  class_count?: number;
  price?: number;
  schedule_id?: string;
  teacher_id?: string;
  // relaciones opcionales
  teacher?: Profesor;
  schedule?: Horario;
  created_at?: string;
  updated_at?: string;
}

export type Horario = {
  id?: string;
  days?: string[];
  start_time?: string;
  end_time?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export type Profesor = {
  id?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}








// este es el json
export type Pago = {
  id?: string;
  payment_amount?: number;
  payment_method?: 'yape' | 'efectivo';
  payment_recipe_url?: string;
  payment_checked?: boolean;
  created_at?: string;
  updated_at?: string;
}

// mejorar segun anotes
export type Asistencia = {
  id?: string;
  inscripcion_id?: string;
  class_date?: string;
  attended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface InscripcionAudit {
  id: string;
  inscripcion_id: string;
  action: AuditAction;
  user_id: string | null;
  user_email: string | null;
  changed_at: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface VoluntarioAudit {
  id: string;
  voluntario_id: string;
  action: AuditAction;
  user_id: string | null;
  user_email: string | null;
  changed_at: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AuditLogView {
  id: string;
  inscripcion_id: string;
  inscripcion_name: string | null;
  action: AuditAction;
  user_email: string | null;
  changed_at: string;
  changed_fields: string[] | null;
  changes_detail: Record<string, { old: any; new: any }> | null;
}

export interface AuditFilters {
  inscripcionId?: string;
  userId?: string;
  action?: AuditAction;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}
