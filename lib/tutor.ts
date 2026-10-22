import { concepto, conceptosEvaluables, estudiantes } from './data'
import { descendientes, padres } from './graph'
import type { Estado, Estudiante, Letra, Rango } from './types'

export const letraAEstado: Record<Letra, Estado> = {
  D: 'dominado',
  P: 'parcial',
  B: 'brecha',
  '?': 'sin-evidencia',
}

const valor: Record<Letra, [number, number, number]> = {
  D: [0.7, 0.85, 1],
  P: [0.4, 0.55, 0.7],
  B: [0, 0.2, 0.4],
  '?': [0, 0.5, 1],
}

/** Cobertura aproximada a partir de las letras (el modelo real usaría los posteriores). */
export function coberturaEstudiante(e: Estudiante): Rango {
  const letras = conceptosEvaluables.map((c) => e.estados[c.id])
  const N = letras.length
  return {
    lo: letras.reduce((s, l) => s + valor[l][0], 0) / N,
    est: letras.reduce((s, l) => s + valor[l][1], 0) / N,
    hi: letras.reduce((s, l) => s + valor[l][2], 0) / N,
  }
}

export interface Motivo {
  tipo: 'base' | 'inactividad' | 'incompleto' | 'nose' | 'incertidumbre'
  texto: string
}

export const COMPLETO = 35

export function motivosAtencion(e: Estudiante): Motivo[] {
  const motivos: Motivo[] = []

  // Brecha en un concepto de base: la primera de su cadena (sus prerrequisitos no tienen brecha).
  const base = conceptosEvaluables
    .filter((c) => c.fila <= 2 && e.estados[c.id] === 'B')
    .filter((c) => padres(c.id).every((p) => e.estados[p] !== 'B'))
    .map((c) => ({ c, frena: [...descendientes(c.id)].filter((d) => !concepto(d).objetivo).length }))
    .sort((x, y) => y.frena - x.frena)[0]
  if (base) {
    motivos.push({
      tipo: 'base',
      texto: `Brecha en ${base.c.nombre.toLowerCase()}, que está en la base de ${base.frena} conceptos de su ruta.`,
    })
  }
  if (e.diasSinActividad >= 7) {
    motivos.push({ tipo: 'inactividad', texto: `Sin actividad hace ${e.diasSinActividad} días.` })
  }
  if (e.preguntas < COMPLETO) {
    motivos.push({
      tipo: 'incompleto',
      texto: `Diagnóstico a medias: ${e.preguntas} de ${e.preguntasTotal} preguntas. Su perfil todavía tiene muchos conceptos sin evidencia.`,
    })
  } else {
    const r = coberturaEstudiante(e)
    if (r.hi - r.lo >= 0.45) {
      motivos.push({
        tipo: 'incertidumbre',
        texto: `Perfil con mucha incertidumbre (${Math.round(r.lo * 100)}–${Math.round(r.hi * 100)}%). Conviene adelantar su mini-diagnóstico.`,
      })
    }
  }
  if (e.noSeSeguidos >= 5) {
    motivos.push({
      tipo: 'nose',
      texto: `Marcó «Todavía no sé» en ${e.noSeSeguidos} preguntas seguidas. Puede que le sirva una conversación para arrancar.`,
    })
  }
  return motivos
}

export function necesitanAtencion(filtro: string | null) {
  return estudiantes
    .map((e) => ({ e, motivos: motivosAtencion(e) }))
    .filter(({ e, motivos }) => motivos.length > 0 && (!filtro || e.estados[filtro] === 'B' || e.estados[filtro] === 'P'))
    .sort((x, y) => y.motivos.length - x.motivos.length || y.e.diasSinActividad - x.e.diasSinActividad)
}

export function conteoPorConcepto(id: string): Record<Letra, number> {
  const c: Record<Letra, number> = { D: 0, P: 0, B: 0, '?': 0 }
  for (const e of estudiantes) c[e.estados[id]]++
  return c
}

export function brechasFrecuentes() {
  return conceptosEvaluables
    .map((c) => ({ id: c.id, ...conteoPorConcepto(c.id) }))
    .sort((x, y) => y.B - x.B || y.P - x.P)
}

function mediana(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function cuartil(xs: number[], q: number) {
  const s = [...xs].sort((a, b) => a - b)
  const pos = (s.length - 1) * q
  const base = Math.floor(pos)
  const resto = pos - base
  return s[base + 1] !== undefined ? s[base] + resto * (s[base + 1] - s[base]) : s[base]
}

export function kpis() {
  const coberturas = estudiantes.map((e) => coberturaEstudiante(e).est)
  const completos = estudiantes.filter((e) => e.preguntas >= COMPLETO).length
  const top = brechasFrecuentes()[0]
  return {
    total: estudiantes.length,
    completos,
    coberturaMediana: mediana(coberturas),
    coberturaQ1: cuartil(coberturas, 0.25),
    coberturaQ3: cuartil(coberturas, 0.75),
    brechaTop: { id: top.id, n: top.B },
    atencion: necesitanAtencion(null).length,
  }
}
