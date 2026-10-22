'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/diagnostico', texto: 'Resumen' },
  { href: '/diagnostico/perfil', texto: 'Mi perfil' },
  { href: '/diagnostico/ruta', texto: 'Mi ruta' },
]

export function DiagnosticoTabs() {
  const ruta = usePathname()
  return (
    <div className="mb-8">
      <h1 className="text-[28px] leading-tight font-semibold sm:text-[32px]">Diagnóstico</h1>
      <p className="mt-1.5 max-w-2xl text-ink-2">Mide cómo llegas a Cálculo I, concepto por concepto, y ordena tu ruta por los módulos.</p>
      <nav aria-label="Secciones del diagnóstico" className="mt-5 border-b border-line">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const on = ruta === t.href
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={on ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center border-b-2 px-3 text-[15px] font-medium whitespace-nowrap transition-colors duration-150 ${
                    on ? 'border-accent text-accent' : 'border-transparent text-ink-2 hover:text-ink'
                  }`}
                >
                  {t.texto}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
