/** Tipos del contenido de los módulos (cursos en video). */

/** Un paso de una solución. Texto con $…$ en línea, o fórmula en bloque si va entre $$…$$. */
export type Paso = string

export interface Ejercicio {
  id: string
  enunciado: string
  tex?: string
  pasos: Paso[]
  resultado: string
}

export interface PreguntaTest {
  id: string
  enunciado: string
  tex?: string
  /** Texto con $…$ en línea. */
  opciones: string[]
  correcta: number
  explicacion: string
}

export interface Leccion {
  id: string
  titulo: string
  /** Duración del video en segundos. */
  duracion: number
  /** Fórmula que se ve en la portada del video. */
  portada: string
  /** Frases del resumen; también se usan como subtítulos del reproductor simulado. */
  resumen: string[]
  objetivos: string[]
  ejercicios: Ejercicio[]
  test: PreguntaTest[]
  enProduccion?: boolean
}

export interface Modulo {
  id: string
  /** Concepto del mapa de prerrequisitos que trabaja este módulo. */
  concepto: string
  numero: number
  titulo: string
  descripcion: string
  docente: string
  lecciones: Leccion[]
}

export const APROBACION = 0.75
