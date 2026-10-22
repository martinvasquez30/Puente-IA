import type { Metadata } from 'next'
import { Contenedor } from '@/components/app/AppShell'
import { DiagnosticoTabs } from '@/components/diagnostico/DiagnosticoTabs'
import { RutaView } from '@/components/ruta/RutaView'

export const metadata: Metadata = { title: 'Mi ruta' }

export default function RutaPagina() {
  return (
    <Contenedor>
      <DiagnosticoTabs />
      <RutaView />
    </Contenedor>
  )
}
