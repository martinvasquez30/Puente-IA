import { Formula, RichText } from './Formula'
import { StatusChip } from './StatusChip'
import { IntervaloMini } from './CoverageBar'
import { concepto as buscar } from '@/lib/data'
import { ancestros, arista, hijos, padres } from '@/lib/graph'
import { fraseEvidencia } from '@/lib/profile'
import type { Estimacion } from '@/lib/types'

interface Props {
  id: string | null
  estimacion?: Estimacion
  vacio?: string
}

/** Panel de texto que acompaña al grafo: es también su alternativa accesible. */
export function ConceptDetail({ id, estimacion, vacio = 'Pasa el cursor, toca o enfoca un concepto con el teclado para ver de qué depende.' }: Props) {
  if (!id) {
    return (
      <div className="rounded-[14px] border border-dashed border-line bg-white p-5 text-sm text-ink-2" aria-live="polite">
        {vacio}
      </div>
    )
  }
  const c = buscar(id)
  const previos = [...ancestros(id).entries()].sort((a, b) => b[1] - a[1]).map(([k]) => buscar(k))
  const directos = padres(id)
  const siguientes = hijos(id).map((h) => buscar(h))

  return (
    <div className="rounded-[14px] border border-line bg-white p-5" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{c.nombre}</h3>
        {estimacion && <StatusChip estado={estimacion.estado} tamano="sm" />}
      </div>
      <p className="mt-1 text-sm text-ink-2">{c.descripcion}</p>
      {c.ejemplo && (
        <div className="mt-3 rounded-[10px] bg-panel px-3 py-2">
          <Formula tex={c.ejemplo} hablado={c.ejemploHablado} bloque className="text-sm" />
        </div>
      )}

      {estimacion && (
        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Lo que sabemos</p>
          <div className="mt-2">
            <IntervaloMini media={estimacion.media} lo={estimacion.lo} hi={estimacion.hi} etiqueta={c.nombre} />
          </div>
          {estimacion.evidencias.length ? (
            <ul className="mt-2 space-y-1 text-sm text-ink-2">
              {estimacion.evidencias.map((ev, i) => (
                <li key={i}>
                  <RichText texto={fraseEvidencia(ev, id)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-2">Aún no sabemos: ninguna pregunta del diagnóstico midió este concepto.</p>
          )}
        </div>
      )}

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-ink-2">Necesitas antes</dt>
          <dd className="mt-1">
            {previos.length ? (
              <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
                {previos.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-1">
                    <span className={`rounded-md px-1.5 py-0.5 ${directos.includes(p.id) ? 'bg-accent-soft text-accent' : 'bg-panel text-ink'}`}>
                      {p.corto}
                    </span>
                    {i < previos.length - 1 && <span aria-hidden="true" className="text-ink-2">·</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-ink-2">Nada: es una base del mapa.</span>
            )}
          </dd>
        </div>
        {directos.length > 0 && (
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-ink-2">Por qué</dt>
            <dd className="mt-1 space-y-1 text-ink-2">
              {directos.map((d) => (
                <p key={d}>
                  <span className="font-medium text-ink">{buscar(d).corto}:</span> <RichText texto={arista(d, id)!.razon} />
                </p>
              ))}
            </dd>
          </div>
        )}
        {siguientes.length > 0 && (
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-ink-2">Desbloquea</dt>
            <dd className="mt-1 text-ink">{siguientes.map((s) => s.corto).join(', ')}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
