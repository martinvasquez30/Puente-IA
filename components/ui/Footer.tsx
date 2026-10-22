import Link from 'next/link'
import { Logo } from './SiteHeader'
import { fuentes } from '@/lib/data'

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-ink-2">
            Nombre provisional. Prototipo navegable: no guarda datos fuera de tu navegador y no reemplaza la orientación de tu universidad.
          </p>
          <p className="mt-3 text-sm text-ink-2">
            Contacto: <span className="font-mono">[CORREO DE CONTACTO]</span>
          </p>
        </div>
        <nav aria-label="Prototipo">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Prototipo</p>
          <ul className="mt-3 grid gap-1 text-sm">
            {[
              ['/', 'Inicio de la app'],
              ['/modulos', 'Módulos en video'],
              ['/diagnostico', 'Diagnóstico, perfil y ruta'],
              ['/tutor', 'Vista docente'],
            ].map(([href, t]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Fuentes</p>
          <ul className="mt-3 grid gap-3 text-sm text-ink-2">
            {fuentes
              .filter((f) => f.enlace !== null)
              .map((f) => (
                <li key={f.id}>
                  <span className="font-mono text-ink">{f.cifra}</span> {f.texto.split('.')[0]}. {f.fuente}.{' '}
                  <span className="font-mono">{f.enlace}</span>
                </li>
              ))}
            <li>Todo lo demás en este sitio son datos de ejemplo.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 font-mono text-xs text-ink-2 sm:px-6">Puente · prototipo [VERSIÓN] · [AÑO]</p>
      </div>
    </footer>
  )
}
