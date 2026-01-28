export const daysConfig = {
  'lunes': { name: 'Lunes', shortName: 'L' },
  'martes': { name: 'Martes', shortName: 'M' },
  'miercoles': { name: 'Miercoles', shortName: 'Mi' },
  'jueves': { name: 'Jueves', shortName: 'J' },
  'viernes': { name: 'Viernes', shortName: 'V' },
  'sabado': { name: 'Sabado', shortName: 'S' },
  'domingo': { name: 'Domingo', shortName: 'D' },
}

export type DaysConfig = keyof typeof daysConfig