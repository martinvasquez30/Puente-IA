import type { Metadata } from 'next'
import { Contenedor } from '@/components/app/AppShell'
import { DiagnosticoTabs } from '@/components/diagnostico/DiagnosticoTabs'
import { PerfilView } from '@/components/perfil/PerfilView'

export const metadata: Metadata = { title: 'Mi perfil' }

export default function PerfilPagina() {
  return (
    <Contenedor>
      <DiagnosticoTabs />
      <PerfilView />
    </Contenedor>
  )
}
