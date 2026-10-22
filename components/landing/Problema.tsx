import { Seccion } from './Seccion'
import { fuentes } from '@/lib/data'

export function Problema() {
  return (
    <Seccion
      id="problema"
      etiqueta="El problema"
      titulo="Entrar a ingeniería no es lo mismo que llegar preparado a Cálculo I"
      intro={
        <p>
          La admisión dice que puedes entrar, pero no qué conceptos de álgebra o funciones vas a necesitar desde la primera semana. Y la
          nivelación suele ser la misma para todos: se repasa lo que ya sabes y se pasa rápido por lo que no.
        </p>
      }
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {fuentes.map((f) => {
          const pendiente = f.enlace === null
          return (
            <li
              key={f.id}
              className={`flex flex-col rounded-[16px] p-6 ${pendiente ? 'borde-punteado bg-white' : 'border border-line bg-panel'}`}
            >
              <p className={`font-mono text-4xl font-medium tracking-tight ${pendiente ? 'text-ink-2' : 'text-ink'}`}>{f.cifra}</p>
              <p className="mt-3 flex-1 text-[15px] text-ink-2">{f.texto}</p>
              <p className="mt-5 border-t border-line pt-3 font-mono text-xs text-ink-2">
                Fuente: {f.fuente}
                {f.enlace && <span className="block">{f.enlace}</span>}
              </p>
            </li>
          )
        })}
      </ul>
    </Seccion>
  )
}
