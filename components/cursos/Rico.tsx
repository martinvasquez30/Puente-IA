import { Formula, RichText } from '@/components/ui/Formula'

/** Texto con $…$ en línea, o una fórmula en bloque si todo va entre $$…$$. */
export function Rico({ texto, className = '' }: { texto: string; className?: string }) {
  const bloque = texto.match(/^\$\$([\s\S]+)\$\$$/)
  if (bloque) return <Formula tex={bloque[1]} bloque className={`formula-izq my-1 ${className}`} />
  return <RichText texto={texto} className={className} />
}

/** Alternativa de respuesta: las fracciones en tamaño completo. */
export function Opcion({ texto }: { texto: string }) {
  const partes = texto.split(/\$([^$]+)\$/g)
  return (
    <span>
      {partes.map((p, i) => (i % 2 === 1 ? <Formula key={i} tex={`\\displaystyle ${p}`} /> : <span key={i}>{p}</span>))}
    </span>
  )
}
