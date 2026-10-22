import Link from 'next/link'

export function AvisoEjemplo() {
  return (
    <div className="mb-8 flex flex-col gap-3 rounded-[14px] borde-punteado bg-white p-4 sm:flex-row sm:items-center sm:justify-between" role="note">
      <p className="text-[15px]">
        <span className="font-medium">Estás viendo un perfil de ejemplo.</span>{' '}
        <span className="text-ink-2">Son las respuestas de un estudiante ficticio. Haz el diagnóstico para ver el tuyo.</span>
      </p>
      <Link
        href="/diagnostico/prueba"
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[10px] bg-ink px-4 text-sm font-medium text-white hover:bg-ink/90"
      >
        Hacer el diagnóstico
      </Link>
    </div>
  )
}
