import { Seccion } from './Seccion'

const FILAS = [
  ['Punto de partida', 'La misma prueba y el mismo curso para todos.', 'Un perfil por concepto, distinto para cada estudiante.'],
  ['Resultado', 'Un puntaje.', 'Un estado por concepto, con su rango de confianza.'],
  ['Lo que ya sabes', 'Se repasa igual.', 'Se salta, cuando hay evidencia de que lo dominas.'],
  ['Orden', 'El del temario.', 'El de los prerrequisitos, explicado paso a paso.'],
  ['Tiempo', 'Prueba cronometrada.', 'Sin cronómetro: el tiempo no cuenta.'],
  ['Para el tutor', 'Promedios del curso.', 'Qué concepto frena a quién, y por qué.'],
]

export function Comparacion() {
  return (
    <Seccion id="comparacion" etiqueta="Comparación" titulo="Lo que cambia respecto de la nivelación tradicional">
      <div className="overflow-hidden rounded-[16px] border border-line">
        <table className="w-full table-fixed border-collapse text-left text-[15px]">
          <caption className="sr-only">Comparación entre la nivelación tradicional y Puente</caption>
          <colgroup>
            <col className="hidden w-[22%] md:table-column" />
            <col />
            <col />
          </colgroup>
          <thead className="bg-panel">
            <tr>
              <th scope="col" className="hidden p-4 font-mono text-xs font-medium uppercase tracking-wider text-ink-2 md:table-cell">
                Aspecto
              </th>
              <th scope="col" className="p-4 font-mono text-xs font-medium uppercase tracking-wider text-ink-2">
                Nivelación tradicional
              </th>
              <th scope="col" className="border-l border-line p-4 font-mono text-xs font-medium uppercase tracking-wider text-accent">
                Puente
              </th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map(([aspecto, trad, puente]) => (
              <tr key={aspecto} className="border-t border-line align-top">
                <th scope="row" className="hidden p-4 font-medium md:table-cell">
                  {aspecto}
                </th>
                <td className="p-4 text-ink-2">
                  <span className="mb-1 block text-xs font-medium text-ink md:hidden">{aspecto}</span>
                  {trad}
                </td>
                <td className="border-l border-line p-4 text-ink">
                  <span className="mb-1 block text-xs font-medium text-ink md:hidden" aria-hidden="true">
                    &nbsp;
                  </span>
                  {puente}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Seccion>
  )
}
