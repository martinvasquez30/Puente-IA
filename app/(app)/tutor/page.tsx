import type { Metadata } from 'next'
import { TutorDashboard } from '@/components/tutor/TutorDashboard'

export const metadata: Metadata = { title: 'Vista docente' }

export default function TutorPagina() {
  return <TutorDashboard />
}
