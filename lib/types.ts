export type Estado = 'dominado' | 'parcial' | 'brecha' | 'sin-evidencia'

/** Letra corta que acompaña siempre al color: el estado nunca se comunica solo con color. */
export type Letra = 'D' | 'P' | 'B' | '?'

export interface Concepto {
  id: string
  nombre: string
  corto: string
  /** Abreviatura para encabezados de tablas densas. */
  abrev: string
  /** Capa del grafo (0 = bases). */
  fila: number
  /** Posición horizontal relativa dentro de la capa (0–1). */
  x: number
  descripcion: string
  ejemplo?: string
  ejemploHablado?: string
  objetivo?: boolean
}

export interface Arista {
  desde: string
  hacia: string
  /** Por qué `desde` es prerrequisito de `hacia`. Puede incluir LaTeX entre $…$. */
  razon: string
}

export interface Alternativa {
  id: string
  tex?: string
  texto?: string
  hablado: string
  /** Crédito parcial (0–1) cuando la alternativa muestra comprensión incompleta. */
  credito?: number
  /** Concepto distinto al principal que este error revela. */
  diagnostica?: string
  nota?: string
}

export interface Item {
  id: string
  concepto: string
  secundarios: string[]
  enunciado: string
  tex: string
  hablado: string
  correcta: string
  alternativas: Alternativa[]
}

export const NO_SE = 'nose'
export type Respuestas = Record<string, string>

export type Resultado = 'correcta' | 'parcial' | 'incorrecta' | 'nose'

export interface Evidencia {
  /** Número de la pregunta (1-indexado). */
  pregunta: number
  resultado: Resultado
  directa: boolean
  peso: number
  nota?: string
  /** Concepto principal del ítem que aportó la evidencia. */
  deConcepto: string
  /** 'test' cuando viene del test de una lección y no del diagnóstico. */
  fuente?: 'test'
  titulo?: string
  detalle?: string
}

export interface Estimacion {
  id: string
  estado: Estado
  /** Dominio estimado (0–1). null si no hay evidencia. */
  media: number | null
  lo: number
  hi: number
  /** Peso total de la evidencia observada. */
  n: number
  evidencias: Evidencia[]
}

export interface Rango {
  est: number
  lo: number
  hi: number
}

export interface Perfil {
  conceptos: Record<string, Estimacion>
  cobertura: Rango
  empezar: { id: string; razones: string[]; desbloquea: string[] } | null
  respondidas: number
  noSe: number
  sinEvidencia: number
}

export type EstadoPaso = 'en-curso' | 'disponible' | 'bloqueado' | 'diagnosticar' | 'objetivo'

export interface Paso {
  id: string
  estadoPaso: EstadoPaso
  estadoConcepto: Estado | null
  /** Prerrequisitos que todavía no están dominados. */
  requiere: string[]
  /** Por qué este paso va aquí. Puede incluir LaTeX entre $…$. */
  porQue: string
}

export interface Estudiante {
  id: string
  nombre: string
  preguntas: number
  preguntasTotal: number
  diasSinActividad: number
  noSeSeguidos: number
  estados: Record<string, Letra>
}
