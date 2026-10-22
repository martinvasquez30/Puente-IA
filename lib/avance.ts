import { buscarLeccion, modulos } from '@/data/modulos'
import type { Leccion, Modulo } from './cursos'
import type { Progreso } from './progreso'

const VACIA = { video: 0, visto: false, ejercicios: {}, soluciones: [] as string[] }

export function estadoLeccion(p: Progreso, l: Leccion) {
  const pl = p.lecciones[l.id] ?? VACIA
  const hechos = Object.keys(pl.ejercicios).length
  const bien = Object.values(pl.ejercicios).filter((e) => e === 'bien').length
  return {
    video: pl.video,
    visto: pl.visto,
    ejercicios: hechos,
    ejerciciosBien: bien,
    test: pl.test,
    completada: !l.enProduccion && pl.visto && Boolean(pl.test?.aprobado),
    iniciada: pl.video > 0 || hechos > 0 || Boolean(pl.test),
  }
}

export function avanceModulo(p: Progreso, m: Modulo) {
  const disponibles = m.lecciones.filter((l) => !l.enProduccion)
  const completadas = disponibles.filter((l) => estadoLeccion(p, l).completada).length
  const iniciado = m.lecciones.some((l) => estadoLeccion(p, l).iniciada)
  return {
    completadas,
    disponibles: disponibles.length,
    enProduccion: m.lecciones.length - disponibles.length,
    fraccion: disponibles.length ? completadas / disponibles.length : 0,
    iniciado,
    completo: disponibles.length > 0 && completadas === disponibles.length,
    duracion: m.lecciones.reduce((s, l) => s + l.duracion, 0),
  }
}

/** Primera lección no completada del módulo (o la primera, si todas lo están). */
export function leccionSiguiente(p: Progreso, m: Modulo): Leccion {
  return m.lecciones.find((l) => !l.enProduccion && !estadoLeccion(p, l).completada) ?? m.lecciones[0]
}

/** Resultado del último intento de cada test, como evidencia para el perfil. */
export function evidenciasDeTests(p: Progreso) {
  return Object.entries(p.lecciones)
    .filter(([, l]) => l.test)
    .map(([id, l]) => {
      const ref = buscarLeccion(id)
      return ref
        ? { concepto: ref.modulo.concepto, aciertos: l.test!.aciertos, total: l.test!.total, titulo: ref.leccion.titulo }
        : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
}

export function resumenGeneral(p: Progreso) {
  const lecciones = modulos.flatMap((m) => m.lecciones.filter((l) => !l.enProduccion).map((l) => ({ m, l, e: estadoLeccion(p, l) })))
  const tests = lecciones.filter((x) => x.e.test)
  return {
    lecciones: lecciones.length,
    completadas: lecciones.filter((x) => x.e.completada).length,
    videos: lecciones.filter((x) => x.e.visto).length,
    minutosVideo: Math.round(lecciones.reduce((s, x) => s + x.e.video * x.l.duracion, 0) / 60),
    ejercicios: lecciones.length * 5,
    ejerciciosHechos: lecciones.reduce((s, x) => s + x.e.ejercicios, 0),
    ejerciciosBien: lecciones.reduce((s, x) => s + x.e.ejerciciosBien, 0),
    testsRendidos: tests.length,
    testsAprobados: tests.filter((x) => x.e.test!.aprobado).length,
    promedioTests: tests.length ? tests.reduce((s, x) => s + x.e.test!.aciertos / x.e.test!.total, 0) / tests.length : null,
    hayActividad: p.eventos.length > 0 || Object.keys(p.lecciones).length > 0,
  }
}

export function formatoDuracion(segundos: number) {
  const m = Math.round(segundos / 60)
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`
}

export function formatoReloj(segundos: number) {
  const s = Math.max(0, Math.floor(segundos))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
