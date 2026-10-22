import Link from 'next/link'
import { Seccion } from './Seccion'

const PUNTOS = [
  {
    titulo: 'Panel por sección',
    texto: 'Cada tutor ve un mapa de calor estudiante × concepto, las brechas más frecuentes y a quién conviene escribirle esta semana, con el motivo.',
  },
  {
    titulo: 'Sin etiquetas sobre personas',
    texto: 'Mostramos conceptos y motivos concretos («sin actividad hace 9 días», «brecha en factorización»). Nunca rótulos como «en riesgo».',
  },
  {
    titulo: 'Recomendaciones que se explican',
    texto: 'Cada paso de la ruta y cada alerta del panel dice en qué evidencia se basa, para que el tutor pueda revisarla y discrepar.',
  },
  {
    titulo: 'Datos e integración',
    texto: '[POLÍTICA DE DATOS Y PRIVACIDAD POR DEFINIR]. [INTEGRACIÓN CON LMS Y SISTEMAS DE MATRÍCULA: EN EVALUACIÓN].',
  },
]

export function Universidades() {
  return (
    <Seccion
      id="universidades"
      etiqueta="Para universidades"
      titulo="Pensado para coordinaciones de nivelación y tutores de primer año"
      fondo="panel"
      intro={<p>El diagnóstico ocurre entre enero y marzo; el panel acompaña a cada sección durante el semestre.</p>}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {PUNTOS.map((p) => (
          <li key={p.titulo} className="rounded-[16px] border border-line bg-white p-6">
            <h3 className="text-lg font-semibold">{p.titulo}</h3>
            <p className="mt-2 text-[15px] text-ink-2">{p.texto}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-4 rounded-[16px] border border-line bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-semibold">¿Te interesa un piloto?</p>
          <p className="mt-1 text-[15px] text-ink-2">
            Escríbenos a <span className="font-mono">[CORREO DE CONTACTO]</span>. Condiciones del piloto: <span className="font-mono">[POR DEFINIR]</span>.
          </p>
        </div>
        <Link
          href="/tutor"
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[12px] bg-ink px-5 font-medium text-white transition-colors duration-150 hover:bg-ink/90"
        >
          Ver el panel del tutor
        </Link>
      </div>
    </Seccion>
  )
}
