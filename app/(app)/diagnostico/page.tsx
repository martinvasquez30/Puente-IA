import type { Metadata } from 'next'
import { Contenedor } from '@/components/app/AppShell'
import { DiagnosticoTabs } from '@/components/diagnostico/DiagnosticoTabs'
import { ResumenDiagnostico } from '@/components/diagnostico/ResumenDiagnostico'

export const metadata: Metadata = { title: 'Diagnóstico' }

export default function DiagnosticoPagina() {
  return (
    <Contenedor>
      <DiagnosticoTabs />
      <ResumenDiagnostico />
    </Contenedor>
  )
}
