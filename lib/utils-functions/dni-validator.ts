// utils/validators/dni.ts
export function isValidPeruDni(dni: string): boolean {
  if (!/^[0-9]\d{7}$/.test(dni)) return false

  // DNIs inválidos comunes
  const invalids = [
    '00000000',
    '11111111',
    '22222222',
    '33333333',
    '44444444',
    '55555555',
    '66666666',
    '77777777',
    '88888888',
    '99999999',
  ]

  if (invalids.includes(dni)) return false

  return true
}
