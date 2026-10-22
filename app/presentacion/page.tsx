import type { Metadata } from 'next'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { Footer } from '@/components/ui/Footer'
import { Hero } from '@/components/landing/Hero'
import { Problema } from '@/components/landing/Problema'
import { ComoFunciona } from '@/components/landing/ComoFunciona'
import { Mapa } from '@/components/landing/Mapa'
import { Comparacion } from '@/components/landing/Comparacion'
import { Universidades } from '@/components/landing/Universidades'
import { Roadmap } from '@/components/landing/Roadmap'

export const metadata: Metadata = { title: 'Acerca de Puente' }

export default function Presentacion() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <Problema />
        <ComoFunciona />
        <Mapa />
        <Comparacion />
        <Universidades />
        <Roadmap />
      </main>
      <Footer />
    </>
  )
}
