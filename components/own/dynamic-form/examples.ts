// ============================================
// EJEMPLOS DE USO DE disabledWhen
// ============================================

import type { FieldConfig } from '@/shared/types/ui.types'

// ============================================
// EJEMPLO 1: Deshabilitar cuando un checkbox NO está marcado
// ============================================
const fields1: FieldConfig[] = [
  {
    name: 'enable_customization',
    label: '¿Habilitar personalización?',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'custom_value',
    label: 'Valor personalizado',
    type: 'text',
    required: false,
    // Se deshabilita cuando enable_customization NO es true
    disabledWhen: {
      field: 'enable_customization',
      value: true // Cuando NO es true, se deshabilita
    }
  }
]

// ============================================
// EJEMPLO 2: Deshabilitar cuando un select tiene un valor específico
// ============================================
const fields2: FieldConfig[] = [
  {
    name: 'payment_type',
    label: 'Tipo de pago',
    type: 'select',
    required: true,
    options: [
      { value: 'cash', label: 'Efectivo' },
      { value: 'card', label: 'Tarjeta' },
      { value: 'transfer', label: 'Transferencia' }
    ]
  },
  {
    name: 'card_number',
    label: 'Número de tarjeta',
    type: 'text',
    required: false,
    // Se deshabilita cuando payment_type NO es 'card'
    disabledWhen: {
      field: 'payment_type',
      value: 'card'
    }
  },
  {
    name: 'transfer_reference',
    label: 'Referencia de transferencia',
    type: 'text',
    required: false,
    // Se deshabilita cuando payment_type NO es 'transfer'
    disabledWhen: {
      field: 'payment_type',
      value: 'transfer'
    }
  }
]

// ============================================
// EJEMPLO 3: Deshabilitar cuando un campo está vacío
// ============================================
const fields3: FieldConfig[] = [
  {
    name: 'course_id',
    label: 'Curso',
    type: 'select',
    required: true,
    options: [
      { value: '1', label: 'Matemáticas' },
      { value: '2', label: 'Física' }
    ]
  },
  {
    name: 'custom_price',
    label: 'Precio personalizado',
    type: 'price',
    required: false,
    // Se deshabilita cuando NO hay un curso seleccionado
    // (cuando course_id está vacío o es falsy)
    disabledWhen: {
      field: 'course_id',
      // Sin value, se deshabilita cuando el campo está vacío
    }
  }
]

// ============================================
// EJEMPLO 4: Combinar dependsOn con disabledWhen
// ============================================
const fields4: FieldConfig[] = [
  {
    name: 'has_discount',
    label: '¿Tiene descuento?',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'discount_type',
    label: 'Tipo de descuento',
    type: 'select',
    required: false,
    options: [
      { value: 'percentage', label: 'Porcentaje' },
      { value: 'fixed', label: 'Monto fijo' }
    ],
    // Solo se muestra si has_discount es true
    dependsOn: {
      field: 'has_discount',
      value: true
    }
  },
  {
    name: 'discount_value',
    label: 'Valor del descuento',
    type: 'integer',
    required: false,
    // Solo se muestra si has_discount es true
    dependsOn: {
      field: 'has_discount',
      value: true
    },
    // Se deshabilita si no hay un tipo de descuento seleccionado
    disabledWhen: {
      field: 'discount_type',
    }
  }
]

// ============================================
// EJEMPLO 5: Caso de uso real - Inscripciones
// ============================================
const inscriptionFields: FieldConfig[] = [
  {
    name: 'course_id',
    label: 'Curso',
    type: 'select',
    required: true,
    options: [], // Cargar dinámicamente
  },
  {
    name: 'is_personalized',
    label: '¿Personalizar?',
    type: 'checkbox',
    required: false,
    dependsOn: {
      field: 'course_id',
      value: undefined // Se muestra cuando hay curso seleccionado
    }
  },
  {
    name: 'total_classes',
    label: 'Número de clases',
    type: 'integer',
    required: false,
    dependsOn: {
      field: 'course_id',
      value: undefined // Se muestra cuando hay curso seleccionado
    },
    disabledWhen: {
      field: 'is_personalized',
      value: true // Se deshabilita cuando NO está personalizado
    }
  },
  {
    name: 'price_charged',
    label: 'Precio',
    type: 'price',
    required: false,
    dependsOn: {
      field: 'course_id',
      value: undefined // Se muestra cuando hay curso seleccionado
    },
    disabledWhen: {
      field: 'is_personalized',
      value: true // Se deshabilita cuando NO está personalizado
    }
  }
]

// ============================================
// RESUMEN DE COMPORTAMIENTO
// ============================================

/*
disabledWhen se comporta de la siguiente manera:

1. CON VALOR ESPECÍFICO:
   disabledWhen: { field: 'myField', value: 'someValue' }
   → Se DESHABILITA cuando myField NO es igual a 'someValue'

2. SIN VALOR (undefined):
   disabledWhen: { field: 'myField' }
   → Se DESHABILITA cuando myField está vacío (falsy)

3. DIFERENCIA CON dependsOn:
   - dependsOn: Controla VISIBILIDAD (mostrar/ocultar)
   - disabledWhen: Controla ESTADO (habilitado/deshabilitado)

4. PUEDEN USARSE JUNTOS:
   - Primero se evalúa dependsOn (si el campo es visible)
   - Luego se evalúa disabledWhen (si está habilitado)

5. PRIORIDAD:
   - Si disabled=true está explícito, siempre se deshabilita
   - Si no, se evalúa disabledWhen
*/