import katex from 'katex'

interface Props {
  tex: string
  /** Lectura en español para lectores de pantalla. Si falta, se usa el MathML de KaTeX. */
  hablado?: string
  bloque?: boolean
  className?: string
}

export function Formula({ tex, hablado, bloque = false, className = '' }: Props) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: bloque,
    output: hablado ? 'html' : 'htmlAndMathml',
  })
  const Tag = bloque ? 'div' : 'span'
  const clases = `${bloque ? 'formula-bloque' : ''} ${className}`.trim()
  if (hablado) {
    return (
      <Tag className={clases}>
        <span className="sr-only">{hablado}</span>
        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
      </Tag>
    )
  }
  return <Tag className={clases} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Texto con fórmulas en línea entre $…$. */
export function RichText({ texto, className }: { texto: string; className?: string }) {
  const partes = texto.split(/\$([^$]+)\$/g)
  return (
    <span className={className}>
      {partes.map((p, i) => (i % 2 === 1 ? <Formula key={i} tex={p} /> : <span key={i}>{p}</span>))}
    </span>
  )
}
