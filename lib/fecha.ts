/** Próximo lunes que esté al menos a 5 días de `hoy`. */
export function proximoMiniDiagnostico(hoy: Date = new Date()): Date {
  const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  d.setDate(d.getDate() + 5)
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1)
  return d
}

export function formatoFecha(d: Date): string {
  return new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`
}
