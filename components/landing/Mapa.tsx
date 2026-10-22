'use client'

import { useState } from 'react'
import { Seccion } from './Seccion'
import { ConceptDetail } from '@/components/ui/ConceptDetail'
import { PrereqGraph } from '@/components/ui/PrereqGraph'

export function Mapa() {
  const [foco, setFoco] = useState<string | null>(null)
  return (
    <Seccion
      id="mapa"
      etiqueta="El mapa"
      titulo="Qué necesitas antes de qué"
      fondo="panel"
      intro={
        <p>
          Doce conceptos y sus prerrequisitos hacia Cálculo I. Pasa el cursor, toca o recorre con el teclado un concepto: se ilumina toda la
          cadena de la que depende. <span className="text-ink">Es un mapa simplificado para este prototipo.</span>
        </p>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-[18px] border border-line bg-white p-3 sm:p-6">
          <PrereqGraph inicial="limites00" onFoco={setFoco} />
          <p className="mt-2 px-1 text-xs text-ink-2">
            Las flechas van del prerrequisito al concepto que lo usa. Toca un concepto para fijarlo; <kbd className="font-mono">Esc</kbd> lo suelta.
          </p>
        </div>
        <div className="lg:sticky lg:top-20">
          <ConceptDetail id={foco} />
        </div>
      </div>
    </Seccion>
  )
}
