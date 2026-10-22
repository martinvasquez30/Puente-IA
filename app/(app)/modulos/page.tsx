import type { Metadata } from 'next'
import { Contenedor } from '@/components/app/AppShell'
import { Catalogo } from '@/components/cursos/Catalogo'

export const metadata: Metadata = { title: 'Módulos' }

export default function ModulosPagina() {
  return (
    <Contenedor>
      <Catalogo />
    </Contenedor>
  )
}
