import { Seccion } from './Seccion'
import { Formula } from '@/components/ui/Formula'
import { IntervaloMini } from '@/components/ui/CoverageBar'
import { StatusChip } from '@/components/ui/StatusChip'

function Paso({ n, titulo, texto, children }: { n: number; titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col rounded-[16px] border border-line bg-white">
      <div className="p-6 pb-4">
        <p className="font-mono text-sm text-accent">0{n}</p>
        <h3 className="mt-2 text-xl font-semibold">{titulo}</h3>
        <p className="mt-2 text-[15px] text-ink-2">{texto}</p>
      </div>
      <div className="mt-auto rounded-b-[16px] border-t border-line bg-panel p-5" aria-hidden="true">
        {children}
      </div>
    </li>
  )
}

export function ComoFunciona() {
  return (
    <Seccion id="como-funciona" etiqueta="Cómo funciona" titulo="Tres pasos, y cada uno explica el siguiente">
      <ol className="grid gap-4 md:grid-cols-3">
        <Paso
          n={1}
          titulo="Diagnóstico adaptativo"
          texto="Entre 35 y 45 preguntas, unos 40 minutos. Cada respuesta decide qué conviene preguntar después. No hay cronómetro: el tiempo que tardes no cambia el resultado, y «Todavía no sé» es una respuesta válida."
        >
          <div className="rounded-[12px] border border-line bg-white p-3">
            <p className="text-sm">Factoriza:</p>
            <p className="mt-1 text-center">
              <Formula tex="x^2-5x+6" />
            </p>
            <div className="mt-2 grid gap-1.5 text-sm">
              <span className="flex items-center gap-2 rounded-[8px] border border-accent bg-accent-soft px-2 py-1.5">
                <span className="grid size-5 place-items-center rounded-full bg-accent font-mono text-[10px] text-white">C</span>
                <Formula tex="(x-2)(x-3)" />
              </span>
              <span className="flex items-center gap-2 rounded-[8px] border border-dashed border-line px-2 py-1.5 text-ink-2">
                <span className="grid size-5 place-items-center rounded-full border border-dashed border-ink-2/60 font-mono text-[10px]">?</span>
                Todavía no sé resolver esto
              </span>
            </div>
          </div>
        </Paso>
        <Paso
          n={2}
          titulo="Perfil por concepto"
          texto="Cada concepto queda como dominado, parcial, brecha crítica o sin evidencia, con un rango que dice cuánta seguridad tenemos. Si no sabemos, lo decimos."
        >
          <ul className="grid gap-2.5">
            {(
              [
                ['Factorización', 'brecha', 0.22, 0.02, 0.45],
                ['Ecuaciones', 'parcial', 0.5, 0.18, 0.82],
                ['Trigonometría', 'sin-evidencia', null, 0, 1],
              ] as const
            ).map(([n, e, m, lo, hi]) => (
              <li key={n} className="rounded-[10px] border border-line bg-white p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{n}</span>
                  <StatusChip estado={e} tamano="sm" />
                </div>
                <div className="mt-2">
                  <IntervaloMini media={m} lo={lo} hi={hi} etiqueta={n} />
                </div>
              </li>
            ))}
          </ul>
        </Paso>
        <Paso
          n={3}
          titulo="Módulos en video, en orden"
          texto="Cada paso de la ruta es un módulo con videos de profesores, 5 ejercicios con solución y un test por lección. No te mandamos a límites si la factorización todavía cojea."
        >
          <ol className="grid gap-2 text-sm">
            {[
              ['Productos notables', 'En curso', 'bg-accent text-white border-accent'],
              ['Factorización', 'Bloqueado', 'bg-panel text-ink-2 border-line'],
              ['Fracciones algebraicas', 'Bloqueado', 'bg-panel text-ink-2 border-line'],
              ['Límites 0/0', 'Objetivo', 'bg-ink text-white border-ink'],
            ].map(([n, e, c], i) => (
              <li key={n} className="flex items-center justify-between gap-2 rounded-[10px] border border-line bg-white px-2.5 py-2">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-2">{i + 1}</span>
                  {n}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${c}`}>{e}</span>
              </li>
            ))}
          </ol>
        </Paso>
      </ol>
    </Seccion>
  )
}
