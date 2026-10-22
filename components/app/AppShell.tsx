'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icono, type NombreIcono } from './Icono'
import { Logo } from '@/components/ui/SiteHeader'
import { reiniciarProgreso } from '@/lib/progreso'

const SECCIONES: { href: string; texto: string; icono: NombreIcono }[] = [
  { href: '/', texto: 'Inicio', icono: 'inicio' },
  { href: '/modulos', texto: 'Módulos', icono: 'modulos' },
  { href: '/estadisticas', texto: 'Estadísticas', icono: 'estadisticas' },
  { href: '/diagnostico', texto: 'Diagnóstico', icono: 'diagnostico' },
]

const activa = (ruta: string, href: string) => (href === '/' ? ruta === '/' : ruta === href || ruta.startsWith(`${href}/`))

/** Rutas a pantalla completa: la lección y la prueba de diagnóstico llevan su propia barra. */
const enFoco = (ruta: string) => /^\/modulos\/[^/]+\/[^/]+/.test(ruta) || ruta.startsWith('/diagnostico/prueba')

export function AppShell({ children }: { children: React.ReactNode }) {
  const ruta = usePathname()
  const [menu, setMenu] = useState(false)
  useEffect(() => setMenu(false), [ruta])

  if (enFoco(ruta)) return <>{children}</>

  return (
    <div className="min-h-dvh bg-white">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[10px] focus:bg-ink focus:px-4 focus:py-3 focus:text-white">
        Saltar al contenido
      </a>

      {/* Barra lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-white lg:flex">
        <Link href="/" className="mx-3 mt-4 flex min-h-11 items-center rounded-[10px] px-3" aria-label="Puente, inicio">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="mt-6 px-3">
          <ul className="grid gap-1">
            {SECCIONES.map((s) => {
              const on = activa(ruta, s.href)
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    aria-current={on ? 'page' : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium transition-colors duration-150 ${
                      on ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-panel hover:text-ink'
                    }`}
                  >
                    <Icono nombre={s.icono} />
                    {s.texto}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="mt-auto grid gap-1 border-t border-line p-3">
          <Link
            href="/tutor"
            aria-current={activa(ruta, '/tutor') ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium ${
              activa(ruta, '/tutor') ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-panel hover:text-ink'
            }`}
          >
            <Icono nombre="docente" />
            Vista docente
          </Link>
          <Link href="/presentacion" className="flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-ink-2 hover:bg-panel hover:text-ink">
            <Icono nombre="info" />
            Acerca de Puente
          </Link>
          <div className="mt-2 flex items-center gap-3 rounded-[12px] bg-panel px-3 py-2.5">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-ink font-mono text-xs text-white">
              ES
            </span>
            <span className="min-w-0 text-sm leading-tight">
              <span className="block truncate font-medium">[NOMBRE ESTUDIANTE]</span>
              <span className="block truncate text-xs text-ink-2">Ingeniería · Admisión [AÑO]</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur-sm lg:hidden">
        <Link href="/" className="-ml-1 flex min-h-11 items-center rounded-[10px] px-1" aria-label="Puente, inicio">
          <Logo />
        </Link>
        <button
          type="button"
          aria-expanded={menu}
          aria-controls="menu-mas"
          onClick={() => setMenu((m) => !m)}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line px-3 text-sm font-medium"
        >
          <Icono nombre={menu ? 'cerrar' : 'menu'} className="size-4" />
          Más
        </button>
      </header>
      {menu && (
        <div id="menu-mas" className="fixed inset-x-0 top-14 z-30 border-b border-line bg-white p-3 animate-aparecer lg:hidden">
          <ul className="grid gap-1">
            <li>
              <Link href="/tutor" className="flex min-h-12 items-center gap-3 rounded-[10px] px-3 font-medium">
                <Icono nombre="docente" /> Vista docente
              </Link>
            </li>
            <li>
              <Link href="/presentacion" className="flex min-h-12 items-center gap-3 rounded-[10px] px-3 font-medium">
                <Icono nombre="info" /> Acerca de Puente
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Borrar el avance de los módulos guardado en este dispositivo?')) reiniciarProgreso()
                  setMenu(false)
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-[10px] px-3 text-left font-medium"
              >
                <Icono nombre="reiniciar" /> Reiniciar mi avance
              </button>
            </li>
          </ul>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <main id="contenido" className="pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Pestañas inferiores (móvil) */}
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-4">
          {SECCIONES.map((s) => {
            const on = activa(ruta, s.href)
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={on ? 'page' : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${on ? 'text-accent' : 'text-ink-2'}`}
                >
                  <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors duration-150 ${on ? 'bg-accent-soft' : ''}`}>
                    <Icono nombre={s.icono} />
                  </span>
                  {s.texto}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

/** Encabezado estándar de una sección de la app. */
export function EncabezadoSeccion({ titulo, bajada, children }: { titulo: string; bajada?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold sm:text-[32px]">{titulo}</h1>
        {bajada && <div className="mt-1.5 max-w-2xl text-ink-2">{bajada}</div>}
      </div>
      {children}
    </div>
  )
}

export function Contenedor({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 ${className}`}>{children}</div>
}
