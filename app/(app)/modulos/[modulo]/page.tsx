import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Contenedor } from '@/components/app/AppShell'
import { DetalleModulo } from '@/components/cursos/DetalleModulo'
import { modulo, modulos } from '@/data/modulos'

export function generateStaticParams() {
  return modulos.map((m) => ({ modulo: m.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ modulo: string }> }): Promise<Metadata> {
  const { modulo: id } = await params
  return { title: modulo(id)?.titulo ?? 'Módulo' }
}

export default async function ModuloPagina({ params }: { params: Promise<{ modulo: string }> }) {
  const { modulo: id } = await params
  if (!modulo(id)) notFound()
  return (
    <Contenedor>
      <DetalleModulo id={id} />
    </Contenedor>
  )
}
