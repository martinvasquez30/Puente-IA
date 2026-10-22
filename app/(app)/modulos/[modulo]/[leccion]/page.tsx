import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LeccionVista } from '@/components/cursos/LeccionVista'
import { buscarLeccion, modulos } from '@/data/modulos'

export function generateStaticParams() {
  return modulos.flatMap((m) => m.lecciones.map((l) => ({ modulo: m.id, leccion: l.id })))
}

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; leccion: string }> }): Promise<Metadata> {
  const { leccion } = await params
  return { title: buscarLeccion(leccion)?.leccion.titulo ?? 'Lección' }
}

export default async function LeccionPagina({ params }: { params: Promise<{ modulo: string; leccion: string }> }) {
  const { modulo, leccion } = await params
  const ref = buscarLeccion(leccion)
  if (!ref || ref.modulo.id !== modulo) notFound()
  return <LeccionVista leccionId={leccion} />
}
