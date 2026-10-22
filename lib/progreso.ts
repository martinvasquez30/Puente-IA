'use client'

import { useSyncExternalStore } from 'react'
import { buscarLeccion, modulos } from '@/data/modulos'
import { APROBACION } from './cursos'

export type EstadoEjercicio = 'bien' | 'revisar'

export interface ResultadoTest {
  respuestas: Record<string, number>
  aciertos: number
  total: number
  aprobado: boolean
  intentos: number
  fecha: string
}

export interface ProgresoLeccion {
  /** Fracción máxima del video que se alcanzó (0–1). */
  video: number
  visto: boolean
  ejercicios: Record<string, EstadoEjercicio>
  soluciones: string[]
  test?: ResultadoTest
}

export interface Evento {
  tipo: 'video' | 'ejercicio' | 'test'
  leccion: string
  fecha: string
}

export interface Progreso {
  lecciones: Record<string, ProgresoLeccion>
  ultima: string | null
  eventos: Evento[]
  ejemplo?: boolean
}

const CLAVE = 'puente:progreso'
const VACIO: Progreso = { lecciones: {}, ultima: null, eventos: [] }
const LECCION_VACIA: ProgresoLeccion = { video: 0, visto: false, ejercicios: {}, soluciones: [] }

let cache: Progreso | null = null
const oyentes = new Set<() => void>()

function leer(): Progreso {
  if (cache) return cache
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    cache = crudo ? { ...VACIO, ...(JSON.parse(crudo) as Progreso) } : VACIO
  } catch {
    cache = VACIO
  }
  return cache
}

function escribir(p: Progreso) {
  cache = p
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(p))
  } catch {
    // Sin almacenamiento: el progreso vive solo en memoria durante la visita.
  }
  oyentes.forEach((f) => f())
}

function suscribir(f: () => void) {
  oyentes.add(f)
  const alCambiar = (e: StorageEvent) => {
    if (e.key === CLAVE) {
      cache = null
      f()
    }
  }
  window.addEventListener('storage', alCambiar)
  return () => {
    oyentes.delete(f)
    window.removeEventListener('storage', alCambiar)
  }
}

/** Progreso del estudiante guardado en este navegador. En el servidor siempre está vacío. */
export function useProgreso(): Progreso {
  return useSyncExternalStore(suscribir, leer, () => VACIO)
}

export function progresoLeccion(p: Progreso, id: string): ProgresoLeccion {
  return p.lecciones[id] ?? LECCION_VACIA
}

function actualizar(id: string, cambio: (l: ProgresoLeccion) => ProgresoLeccion, evento?: Evento['tipo']) {
  const p = leer()
  const nueva = cambio(progresoLeccion(p, id))
  escribir({
    ...p,
    lecciones: { ...p.lecciones, [id]: nueva },
    eventos: evento ? [...p.eventos, { tipo: evento, leccion: id, fecha: new Date().toISOString() }] : p.eventos,
  })
}

export function abrirLeccion(id: string) {
  const p = leer()
  if (p.ultima !== id) escribir({ ...p, ultima: id })
}

export function avanceVideo(id: string, fraccion: number) {
  const l = progresoLeccion(leer(), id)
  const visto = l.visto || fraccion >= 0.9
  if (fraccion <= l.video && visto === l.visto) return
  actualizar(id, (x) => ({ ...x, video: Math.max(x.video, fraccion), visto }), visto && !l.visto ? 'video' : undefined)
}

export function marcarVisto(id: string) {
  if (progresoLeccion(leer(), id).visto) return
  actualizar(id, (x) => ({ ...x, visto: true, video: Math.max(x.video, 1) }), 'video')
}

export function verSolucion(id: string, ejercicio: string) {
  const l = progresoLeccion(leer(), id)
  if (l.soluciones.includes(ejercicio)) return
  actualizar(id, (x) => ({ ...x, soluciones: [...x.soluciones, ejercicio] }))
}

export function marcarEjercicio(id: string, ejercicio: string, estado: EstadoEjercicio) {
  actualizar(id, (x) => ({ ...x, ejercicios: { ...x.ejercicios, [ejercicio]: estado } }), 'ejercicio')
}

export function registrarTest(id: string, respuestas: Record<string, number>, aciertos: number, total: number) {
  actualizar(
    id,
    (x) => ({
      ...x,
      test: {
        respuestas,
        aciertos,
        total,
        aprobado: aciertos / total >= APROBACION,
        intentos: (x.test?.intentos ?? 0) + 1,
        fecha: new Date().toISOString(),
      },
    }),
    'test',
  )
}

export function reiniciarProgreso() {
  escribir(VACIO)
}

/** Progreso ficticio para mostrar Inicio y Estadísticas con datos. */
export function cargarProgresoEjemplo() {
  const hace = (dias: number, horas = 0) => new Date(Date.now() - dias * 864e5 - horas * 36e5).toISOString()
  const lecciones: Record<string, ProgresoLeccion> = {}
  const eventos: Evento[] = []

  const completar = (id: string, dias: number, ejercicios: EstadoEjercicio[], aciertos: number, intentos = 1) => {
    const ref = buscarLeccion(id)!
    const test = ref.leccion.test
    const respuestas = Object.fromEntries(test.map((q, i) => [q.id, i < aciertos ? q.correcta : (q.correcta + 1) % q.opciones.length]))
    lecciones[id] = {
      video: 1,
      visto: true,
      ejercicios: Object.fromEntries(ejercicios.map((e, i) => [ref.leccion.ejercicios[i].id, e])),
      soluciones: ref.leccion.ejercicios.slice(0, ejercicios.length).map((e) => e.id),
      test: { respuestas, aciertos, total: test.length, aprobado: aciertos / test.length >= APROBACION, intentos, fecha: hace(dias, 1) },
    }
    eventos.push({ tipo: 'video', leccion: id, fecha: hace(dias, 3) })
    ejercicios.forEach(() => eventos.push({ tipo: 'ejercicio', leccion: id, fecha: hace(dias, 2) }))
    eventos.push({ tipo: 'test', leccion: id, fecha: hace(dias, 1) })
  }

  completar('fracciones-1', 12, ['bien', 'bien', 'bien', 'revisar', 'bien'], 4)
  completar('potencias-1', 10, ['bien', 'bien', 'bien', 'bien', 'bien'], 3)
  completar('algebra-1', 7, ['bien', 'bien', 'revisar', 'bien'], 4)
  completar('productos-1', 3, ['bien', 'bien', 'revisar'], 2)
  lecciones['productos-2'] = { video: 0.35, visto: false, ejercicios: {}, soluciones: [] }
  eventos.push({ tipo: 'ejercicio', leccion: 'productos-1', fecha: hace(1, 2) })

  escribir({ lecciones, ultima: 'productos-2', eventos, ejemplo: true })
}

/** Lecciones con contenido, en el orden del catálogo. */
export const totalLecciones = modulos.flatMap((m) => m.lecciones).filter((l) => !l.enProduccion).length
