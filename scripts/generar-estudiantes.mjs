// Genera data/students.json con estudiantes ficticios (datos de ejemplo).
// Uso: node scripts/generar-estudiantes.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const conceptos = JSON.parse(readFileSync(new URL('../data/concepts.json', import.meta.url))).filter((c) => !c.objetivo)
const aristas = JSON.parse(readFileSync(new URL('../data/edges.json', import.meta.url)))

// PRNG con semilla para que el archivo sea reproducible
let semilla = 20260120
function azar() {
  semilla |= 0
  semilla = (semilla + 0x6d2b79f5) | 0
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
function normal() {
  const u = 1 - azar()
  const v = azar()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const sigmoide = (z) => 1 / (1 + Math.exp(-z))

const dificultad = {
  fracciones: -1.3, potencias: -0.9, algebra: -0.7, productos: 0.1, ecuaciones: -0.3,
  factorizacion: 0.35, inecuaciones: 0.3, fracalg: 0.75, funciones: 0.1,
  limites00: 1.0, explog: 0.55, trigo: 0.45,
}

const nombres = [
  'Catalina M.', 'Benjamín R.', 'Martina G.', 'Vicente P.', 'Sofía L.', 'Matías C.', 'Isidora F.',
  'Agustín V.', 'Florencia T.', 'Joaquín A.', 'Antonella S.', 'Tomás H.', 'Emilia N.', 'Maximiliano O.',
  'Josefa D.', 'Lucas B.', 'Trinidad E.', 'Cristóbal I.', 'Javiera U.', 'Diego Z.', 'Valentina Q.',
  'Sebastián K.', 'Fernanda Y.', 'Ignacio J.', 'Constanza W.', 'Felipe X.', 'Amanda R.', 'Bastián M.',
]

const padres = (id) => aristas.filter((a) => a.hacia === id).map((a) => a.desde)
const orden = [...conceptos].sort((a, b) => a.fila - b.fila || a.x - b.x).map((c) => c.id)

const estudiantes = nombres.map((nombre, i) => {
  const theta = normal() * 0.85 + 0.4
  const preguntas = azar() < 0.18 ? 12 + Math.floor(azar() * 20) : 36 + Math.floor(azar() * 7)
  const completo = preguntas >= 35
  const estados = {}
  for (const id of orden) {
    let p = sigmoide(1.7 * (theta - dificultad[id]))
    if (padres(id).some((pid) => estados[pid] === 'B')) p *= 0.7
    const m = Math.min(1, Math.max(0, p + normal() * 0.12))
    let e = m > 0.66 ? 'D' : m < 0.36 ? 'B' : 'P'
    const tardio = ['explog', 'trigo', 'limites00', 'funciones', 'inecuaciones'].includes(id)
    if (!completo && tardio && azar() < 0.8) e = '?'
    if (completo && (id === 'explog' || id === 'trigo') && azar() < 0.2) e = '?'
    estados[id] = e
  }
  const noSeSeguidos = azar() < 0.12 ? 5 + Math.floor(azar() * 4) : Math.floor(azar() * 3)
  const diasSinActividad = azar() < 0.15 ? 8 + Math.floor(azar() * 7) : Math.floor(azar() * 5)
  return {
    id: `e${String(i + 1).padStart(2, '0')}`,
    nombre,
    preguntas,
    preguntasTotal: 40,
    diasSinActividad,
    noSeSeguidos,
    estados,
  }
})

writeFileSync(new URL('../data/students.json', import.meta.url), JSON.stringify(estudiantes, null, 2) + '\n')
console.log(`Generados ${estudiantes.length} estudiantes de ejemplo.`)
