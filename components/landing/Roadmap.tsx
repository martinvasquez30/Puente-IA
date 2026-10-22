import { Seccion } from './Seccion'

const ETAPAS = [
  {
    cuando: 'Ahora',
    estado: 'Prototipo',
    titulo: 'Puente a Cálculo I',
    puntos: ['Diagnóstico de 35–45 preguntas', 'Perfil por concepto con rangos', 'Ruta de nivelación explicada', 'Panel del tutor por sección'],
    actual: true,
  },
  {
    cuando: '[TRIMESTRE]',
    estado: 'En diseño',
    titulo: 'Seguimiento',
    puntos: ['Mini-diagnósticos semanales', 'Banco de ítems calibrado con estudiantes chilenos', 'Contenido de práctica por concepto'],
  },
  {
    cuando: '[POR DEFINIR]',
    estado: 'Exploración',
    titulo: 'Otros puentes',
    puntos: ['[ÁLGEBRA LINEAL / FÍSICA I: POR DEFINIR]', 'Integración con plataformas universitarias', 'Reportes para coordinación'],
  },
]

export function Roadmap() {
  return (
    <Seccion
      id="roadmap"
      etiqueta="Roadmap"
      titulo="Qué viene"
      intro={<p>Un plan de trabajo, no una promesa: las fechas se confirman a medida que avancen los pilotos.</p>}
    >
      <ol className="grid gap-4 md:grid-cols-3">
        {ETAPAS.map((e) => (
          <li
            key={e.titulo}
            className={`rounded-[16px] border p-6 ${e.actual ? 'border-accent bg-white ring-4 ring-accent-soft' : 'border-line bg-white'}`}
          >
            <div className="flex items-center justify-between gap-2 font-mono text-xs uppercase tracking-wider">
              <span className={e.actual ? 'text-accent' : 'text-ink-2'}>{e.cuando}</span>
              <span className="rounded-full border border-line px-2 py-0.5 text-ink-2">{e.estado}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold">{e.titulo}</h3>
            <ul className="mt-3 grid gap-2 text-[15px] text-ink-2">
              {e.puntos.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-2/60" />
                  {p}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Seccion>
  )
}
