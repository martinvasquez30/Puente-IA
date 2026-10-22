import type { Metadata } from 'next'
import { DiagnosticoFlow } from '@/components/diagnostico/DiagnosticoFlow'

export const metadata: Metadata = { title: 'Prueba de diagnóstico' }

export default function PruebaDiagnostico() {
  return (
    <main id="contenido">
      <DiagnosticoFlow />
    </main>
  )
}
