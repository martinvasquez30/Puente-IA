'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { EjemploTag, Etiqueta } from '@/components/ui/Badges'
import { CoverageBar } from '@/components/ui/CoverageBar'
import { StatusChip } from '@/components/ui/StatusChip'
import { concepto, respuestasEjemplo } from '@/lib/data'
import { calcularPerfil } from '@/lib/profile'
import { construirRuta } from '@/lib/route'

const MUESTRA = ['algebra', 'funciones', 'ecuaciones', 'productos', 'fracalg', 'trigo']

export function Hero() {
  const perfil = useMemo(() => calcularPerfil(respuestasEjemplo), [])
  const ruta = useMemo(() => construirRuta(perfil), [perfil])

  return (
    <section aria-labelledby="hero-titulo" className="papel-milimetrado border-b border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 sm:px-6 md:pt-16 md:pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <Etiqueta>Puente a Cálculo I</Etiqueta>
          <h1 id="hero-titulo" className="mt-4 text-[38px] leading-[1.05] font-semibold sm:text-5xl lg:text-[58px]">
            Llega a Cálculo I sabiendo qué te falta. Y qué no.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">
            Un diagnóstico de unos 40 minutos que revisa, concepto por concepto, los prerrequisitos de Cálculo I. Te muestra lo que ya dominas, lo
            que conviene reforzar y lo que todavía no sabemos. Después arma una ruta de nivelación que explica cada paso.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/diagnostico/prueba"
              className="inline-flex min-h-12 items-center justify-center rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6]"
            >
              Probar el diagnóstico
            </Link>
            <Link
              href="/diagnostico/perfil"
              className="inline-flex min-h-12 items-center justify-center rounded-[12px] border border-line bg-white px-5 font-medium text-ink transition-colors duration-150 hover:border-ink-2/50"
            >
              Ver un perfil de ejemplo
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px] text-ink-2">
            <li>35–45 preguntas</li>
            <li>~40 min</li>
            <li>sin cronómetro</li>
            <li>desde el celular</li>
          </ul>
        </div>

        <figure className="rounded-[18px] border border-line bg-white p-5 sm:p-6" aria-labelledby="hero-figura">
          <div className="flex items-center justify-between gap-3">
            <figcaption id="hero-figura" className="font-display text-lg font-semibold">
              Perfil de ejemplo
            </figcaption>
            <EjemploTag />
          </div>
          <CoverageBar rango={perfil.cobertura} className="mt-5" />
          <p className="text-sm text-ink-2">
            El rango es amplio porque {perfil.sinEvidencia} conceptos aún no tienen evidencia.
          </p>

          <ul className="mt-5 divide-y divide-line border-y border-line">
            {MUESTRA.map((id, i) => (
              <li
                key={id}
                className="flex min-h-11 items-center justify-between gap-3 py-2 animate-entrar"
                style={{ animationDelay: `${250 + i * 60}ms` }}
              >
                <span className="text-[15px]">{concepto(id).nombre}</span>
                <StatusChip estado={perfil.conceptos[id].estado} tamano="sm" />
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Empieza por aquí</p>
            <ol className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Cadena de la ruta de ejemplo">
              {ruta.cadena.map((id, i) => (
                <li key={id} className="flex items-center gap-1.5">
                  <span
                    className={`${concepto(id).objetivo ? 'hero-cadena-obj' : 'hero-cadena'} rounded-[8px] border px-2 py-1 text-[13px] font-medium`}
                    style={{ animationDelay: `${700 + i * 160}ms` }}
                  >
                    {concepto(id).corto}
                  </span>
                  {i < ruta.cadena.length - 1 && (
                    <svg aria-hidden="true" viewBox="0 0 12 8" className="h-2 w-3 text-ink-2" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M0 4h10M7 1l3 3-3 3" />
                    </svg>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </figure>
      </div>
    </section>
  )
}
