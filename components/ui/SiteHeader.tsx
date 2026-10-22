'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 32 20" className="h-5 w-8" fill="none">
        <path d="M2 17 C 9 4, 23 4, 30 17" stroke="#2448C8" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 17 H30" stroke="#10233F" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 9.6V17M16 7.4V17M22 9.6V17" stroke="#10233F" strokeWidth="1.5" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">Puente</span>
    </span>
  )
}

const ENLACES = [
  { href: '/', texto: 'Entrar a la app' },
  { href: '/modulos', texto: 'Módulos' },
  { href: '/diagnostico', texto: 'Diagnóstico' },
  { href: '/tutor', texto: 'Vista docente' },
]

export function SiteHeader({ ancho = 'max-w-6xl' }: { ancho?: string }) {
  const ruta = usePathname()
  const [abierto, setAbierto] = useState(false)
  useEffect(() => setAbierto(false), [ruta])

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className={`mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6 ${ancho}`}>
        <Link href="/presentacion" className="-ml-1 flex min-h-11 items-center rounded-[10px] px-1" aria-label="Puente, presentación">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {ENLACES.map((e) => {
              const activo = ruta === e.href
              return (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    aria-current={activo ? 'page' : undefined}
                    className={`inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-medium transition-colors duration-150 ${
                      activo ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-panel hover:text-ink'
                    }`}
                  >
                    {e.texto}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line px-3 text-sm font-medium md:hidden"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto((a) => !a)}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            {abierto ? <path d="M3 3l10 10M13 3L3 13" /> : <path d="M2 4h12M2 8h12M2 12h12" />}
          </svg>
          Menú
        </button>
      </div>
      {abierto && (
        <nav id="menu-movil" aria-label="Principal" className="border-t border-line bg-white px-4 py-2 md:hidden animate-aparecer">
          <ul className="grid">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={ruta === e.href ? 'page' : undefined}
                  className={`flex min-h-12 items-center rounded-[10px] px-3 font-medium ${
                    ruta === e.href ? 'bg-accent-soft text-accent' : 'text-ink'
                  }`}
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
