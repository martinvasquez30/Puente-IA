import type { Metadata } from 'next'
import { Contenedor } from '@/components/app/AppShell'
import { Estadisticas } from '@/components/estadisticas/Estadisticas'

export const metadata: Metadata = { title: 'Estadísticas' }

export default function EstadisticasPagina() {
  return (
    <Contenedor>
      <Estadisticas />
    </Contenedor>
  )
}
