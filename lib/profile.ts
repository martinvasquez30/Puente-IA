import { concepto, conceptosEvaluables, items } from './data'
import { descendientes, padres } from './graph'
import type { Estado, Estimacion, Evidencia, Perfil, Respuestas } from './types'
import { NO_SE } from './types'

/**
 * Motor de reglas del prototipo (no es el modelo real).
 * Cada concepto parte con un prior Beta(0,5; 0,5). Cada respuesta suma evidencia:
 *  - concepto principal del ítem: peso 1 (con crédito parcial si la alternativa lo indica);
 *  - conceptos secundarios: +0,5 de éxito si la respuesta es correcta, +0,25 de fallo si no;
 *  - una alternativa que "diagnostica" otro concepto suma 1 de fallo a ese concepto;
 *  - "Todavía no sé" suma 1 de fallo solo al concepto principal.
 * El tiempo de respuesta no se registra ni se usa.
 */
const PRIOR = 0.5
const Z80 = 1.2816

export const UMBRAL_DOMINADO = 0.7
export const UMBRAL_BRECHA = 0.4

interface Acumulado {
  a: number
  b: number
  ev: Evidencia[]
}

/** Resultado del último intento de un test de lección, que también cuenta como evidencia. */
export interface EvidenciaTest {
  concepto: string
  aciertos: number
  total: number
  titulo: string
}

/** Cada pregunta de test pesa la mitad que una pregunta del diagnóstico. */
const PESO_TEST = 0.5

export function calcularPerfil(respuestas: Respuestas, tests: EvidenciaTest[] = []): Perfil {
  const acc: Record<string, Acumulado> = {}
  for (const c of conceptosEvaluables) acc[c.id] = { a: PRIOR, b: PRIOR, ev: [] }

  let respondidas = 0
  let noSe = 0

  items.forEach((item, i) => {
    const r = respuestas[item.id]
    if (!r) return
    respondidas++
    const pregunta = i + 1
    const principal = acc[item.concepto]

    if (r === NO_SE) {
      noSe++
      principal.b += 1
      principal.ev.push({ pregunta, resultado: 'nose', directa: true, peso: 1, deConcepto: item.concepto })
      return
    }

    const alt = item.alternativas.find((a) => a.id === r)
    if (!alt) return
    const esCorrecta = r === item.correcta
    const credito = esCorrecta ? 1 : (alt.credito ?? 0)
    principal.a += credito
    principal.b += 1 - credito
    principal.ev.push({
      pregunta,
      resultado: esCorrecta ? 'correcta' : credito > 0 ? 'parcial' : 'incorrecta',
      directa: true,
      peso: 1,
      nota: alt.nota,
      deConcepto: item.concepto,
    })

    for (const s of item.secundarios) {
      if (alt.diagnostica === s) continue
      if (esCorrecta) {
        acc[s].a += 0.5
        acc[s].ev.push({ pregunta, resultado: 'correcta', directa: false, peso: 0.5, deConcepto: item.concepto })
      } else {
        acc[s].b += 0.25
        acc[s].ev.push({ pregunta, resultado: 'incorrecta', directa: false, peso: 0.25, deConcepto: item.concepto })
      }
    }

    if (alt.diagnostica && alt.diagnostica !== item.concepto) {
      acc[alt.diagnostica].b += 1
      acc[alt.diagnostica].ev.push({
        pregunta,
        resultado: 'incorrecta',
        directa: false,
        peso: 1,
        nota: alt.nota,
        deConcepto: item.concepto,
      })
    }
  })

  for (const t of tests) {
    const c = acc[t.concepto]
    if (!c) continue
    c.a += PESO_TEST * t.aciertos
    c.b += PESO_TEST * (t.total - t.aciertos)
    c.ev.push({
      pregunta: 0,
      resultado: t.aciertos / t.total >= 0.75 ? 'correcta' : t.aciertos / t.total >= 0.5 ? 'parcial' : 'incorrecta',
      directa: true,
      peso: PESO_TEST * t.total,
      deConcepto: t.concepto,
      fuente: 'test',
      detalle: `${t.aciertos} de ${t.total}`,
      titulo: t.titulo,
    })
  }

  const conceptos: Record<string, Estimacion> = {}
  for (const c of conceptosEvaluables) {
    const { a, b, ev } = acc[c.id]
    const n = a + b - 2 * PRIOR
    if (n <= 0) {
      conceptos[c.id] = { id: c.id, estado: 'sin-evidencia', media: null, lo: 0, hi: 1, n: 0, evidencias: [] }
      continue
    }
    const media = a / (a + b)
    const semi = Z80 * Math.sqrt((media * (1 - media)) / (a + b + 1))
    conceptos[c.id] = {
      id: c.id,
      estado: clasificar(media, n),
      media,
      lo: Math.max(0, media - semi),
      hi: Math.min(1, media + semi),
      n,
      evidencias: ev.sort((x, y) => (x.fuente === 'test' ? 1 : 0) - (y.fuente === 'test' ? 1 : 0) || x.pregunta - y.pregunta),
    }
  }

  const lista = Object.values(conceptos)
  const N = lista.length
  const cobertura = {
    est: lista.reduce((s, e) => s + (e.media ?? 0.5), 0) / N,
    lo: lista.reduce((s, e) => s + (e.media === null ? 0 : e.lo), 0) / N,
    hi: lista.reduce((s, e) => s + (e.media === null ? 1 : e.hi), 0) / N,
  }

  return {
    conceptos,
    cobertura,
    empezar: elegirInicio(conceptos),
    respondidas,
    noSe,
    sinEvidencia: lista.filter((e) => e.estado === 'sin-evidencia').length,
  }
}

function clasificar(media: number, n: number): Estado {
  // Con menos de una pregunta de evidencia no afirmamos ni dominio ni brecha.
  if (n >= 1 && media >= UMBRAL_DOMINADO) return 'dominado'
  if (n >= 1 && media <= UMBRAL_BRECHA) return 'brecha'
  return 'parcial'
}

const prioridad: Record<Estado, number> = { brecha: 0, parcial: 1, 'sin-evidencia': 2, dominado: 3 }

/**
 * "Empieza por aquí": el concepto con brecha (o parcial) cuyos prerrequisitos ya están dominados.
 * Entre varios, gana el que desbloquea más conceptos; luego el de la capa más baja.
 */
function elegirInicio(est: Record<string, Estimacion>): Perfil['empezar'] {
  const candidatos = conceptosEvaluables.filter((c) => {
    const e = est[c.id]
    if (e.estado !== 'brecha' && e.estado !== 'parcial') return false
    return padres(c.id).every((p) => est[p]?.estado === 'dominado')
  })
  if (!candidatos.length) return null

  candidatos.sort((x, y) => {
    const px = prioridad[est[x.id].estado]
    const py = prioridad[est[y.id].estado]
    if (px !== py) return px - py
    const dx = descendientes(x.id).size
    const dy = descendientes(y.id).size
    if (dx !== dy) return dy - dx
    return x.fila - y.fila
  })

  const elegido = candidatos[0]
  const e = est[elegido.id]
  const razones = e.evidencias
    .filter((ev) => ev.resultado !== 'correcta')
    .map((ev) => fraseEvidencia(ev, elegido.id))
  const prereqs = padres(elegido.id)
  razones.push(
    prereqs.length
      ? `Sus prerrequisitos (${prereqs.map((p) => concepto(p).nombre).join(', ')}) aparecen como dominados, así que es el primer paso firme.`
      : 'No depende de otros conceptos del mapa, así que se puede trabajar de inmediato.',
  )
  const desbloquea = [...descendientes(elegido.id)]
    .filter((id) => !concepto(id).objetivo && est[id]?.estado !== 'dominado')
    .sort((x, y) => concepto(x).fila - concepto(y).fila)
  return { id: elegido.id, razones, desbloquea }
}

export function fraseEvidencia(ev: Evidencia, conceptoId: string): string {
  if (ev.fuente === 'test') {
    return `En el test de «${ev.titulo}» acertaste ${ev.detalle}.`
  }
  const p = `pregunta ${ev.pregunta}`
  if (ev.resultado === 'correcta') {
    return ev.directa
      ? `Respondiste bien la ${p}.`
      : `La ${p} (${concepto(ev.deConcepto).corto}) también usaba este concepto y salió bien.`
  }
  if (ev.resultado === 'nose') {
    return `En la ${p} marcaste «Todavía no sé resolver esto». Eso también es información útil.`
  }
  if (ev.directa) {
    return ev.nota ? `En la ${p}: ${ev.nota}` : `La ${p}, que mide este concepto directamente, no salió.`
  }
  if (ev.nota && ev.peso >= 1) {
    return `En la ${p} (de ${concepto(ev.deConcepto).corto.toLowerCase()}): ${ev.nota}`
  }
  return `La ${p} (${concepto(ev.deConcepto).corto}) usaba ${concepto(conceptoId).corto.toLowerCase()} y no salió; es evidencia indirecta.`
}
