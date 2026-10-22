# Puente (nombre provisional): prototipo

Aplicación de cursos para **Puente a Cálculo I**, al estilo de una plataforma tipo Coursera. Cada módulo tiene lecciones en video de profesores. Bajo cada video hay 5 ejercicios con su solución paso a paso y un test. Aparte hay una sección de **Estadísticas** y otra de **Diagnóstico** (prueba, perfil por concepto y ruta).

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + KaTeX. Sin backend: el contenido sale de `data/` y el avance se guarda en el `localStorage` del navegador.

## Cómo correrlo

Requiere Node 20.9 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

- Build de producción: `npm run build && npm start`.
- Para ver Inicio y Estadísticas con datos, usa "Cargar avance de ejemplo" en Estadísticas.
- Para empezar de cero, usa "Reiniciar mi avance" en Estadísticas (o en el menú "Más" en el celular).
- Regenerar los estudiantes ficticios de la vista docente: `node scripts/generar-estudiantes.mjs`.

## Secciones y rutas

| Sección | Ruta | Qué hay |
|---|---|---|
| Inicio | `/` | "Continuar donde quedaste", módulos recomendados según el diagnóstico, resumen de la ruta, próximo mini-diagnóstico y avance |
| Módulos | `/modulos` | Catálogo de 12 módulos con filtros (todos, recomendados, en curso, completados) y búsqueda |
| | `/modulos/[modulo]` | Detalle del módulo: lecciones con su avance, qué dice tu diagnóstico, prerrequisitos y a qué te prepara |
| | `/modulos/[modulo]/[leccion]` | Lección a pantalla completa: video, 5 ejercicios con solución, test y temario lateral |
| Estadísticas | `/estadisticas` | KPIs, resultados de tests, actividad de 14 días, avance por módulo y dominio por concepto |
| Diagnóstico | `/diagnostico` | Resumen: estado del diagnóstico, «Empieza por aquí» y próximo mini-diagnóstico |
| | `/diagnostico/prueba` | Las 8 preguntas a pantalla completa, con «Todavía no sé» y pausa |
| | `/diagnostico/perfil` | Perfil por concepto con rangos, por estado o como mapa |
| | `/diagnostico/ruta` | Ruta ordenada por prerrequisitos; cada paso enlaza a su módulo |
| Vista docente | `/tutor` | El panel de sección anterior (mapa de calor, «Necesitan atención», brechas) |
| Acerca de | `/presentacion` | La landing anterior |

Las rutas viejas `/perfil` y `/ruta` redirigen a las nuevas.

## Estructura

```
app/(app)/            todas las secciones de la app, dentro del shell (barra lateral / pestañas)
app/presentacion/     landing
components/app/       AppShell (barra lateral, pestañas móviles, modo foco), Icono, Portada
components/cursos/    Catalogo, ModuloCard, DetalleModulo, LeccionVista, VideoPlayer,
                      EjercicioCard, TestLeccion, Temario, Rico
components/inicio/ components/estadisticas/ components/diagnostico/ components/perfil/ components/ruta/ components/tutor/
components/ui/        StatusChip, CoverageBar, PrereqGraph, QuestionCard, RouteStep, HeatmapCell, …
data/modulos.ts       12 módulos, 24 lecciones (16 con contenido completo: 80 ejercicios y 64 preguntas de test)
data/*.json           mapa de conceptos, aristas, ítems del diagnóstico, estudiantes ficticios, fuentes
lib/progreso.ts       avance del estudiante (video, ejercicios, tests) con useSyncExternalStore + localStorage
lib/avance.ts         estado de lección y módulo, resumen para Estadísticas
lib/profile.ts        motor del perfil: diagnóstico + resultados de tests
lib/route.ts          orden de la ruta; lib/useRecomendaciones.ts une perfil, ruta y módulos
```

## Decisiones de diseño

1. **Navegación de app.**
   - En escritorio hay una barra lateral fija. En el celular hay pestañas abajo (Inicio · Módulos · Estadísticas · Diagnóstico) y un menú "Más" para la vista docente.
   - La lección y la prueba de diagnóstico abren en **modo foco**: sin navegación general, con su propia barra para volver.
2. **Lección tipo Coursera.**
   - Hay un temario lateral (un cajón en el celular) con el estado de cada parte: video, ejercicios y test.
   - El contenido va en una sola página que se recorre hacia abajo: video → ejercicios → test, y al final la lección anterior y la siguiente.
3. **Qué es una lección completada.** Una lección se completa cuando el video está visto (90% o más, o marcado a mano) y el test está aprobado (3 de 4). Los ejercicios no bloquean nada: son práctica.
4. **Ejercicios.**
   - La solución está oculta hasta que la pides ("intenta resolverlo en papel").
   - Se muestra paso a paso y cierra con el resultado destacado.
   - Después marcas "Me salió" o "Me equivoqué". La app aclara que no es nota.
5. **Test.**
   - Todas las preguntas en una página, sin tiempo límite y con reintentos.
   - Al enviar, el resultado dice aprobado o no con ícono y texto, no solo con color.
   - Cada pregunta trae su explicación, y el foco pasa al resultado para el lector de pantalla.
6. **Los tests alimentan el diagnóstico.** Cada pregunta de test suma evidencia al concepto del módulo con la mitad del peso de una pregunta del diagnóstico. Si apruebas los tests de un módulo, el concepto puede pasar a "Dominado" y la ruta avanza sola.
7. **Recomendaciones explicadas.**
   - Las tarjetas muestran "Empieza por aquí" o "Recomendado" según la ruta, y el estado del concepto con su letra.
   - El detalle del módulo explica por qué te lo recomendamos o por qué no.
   - Ningún módulo se bloquea: puedes elegir cualquiera.
8. **Video simulado y honesto.** No hay grabaciones. La portada es una "pizarra" con la fórmula central de la lección, y el reproductor dice "Video simulado ×20". Tiene pausa, barra de avance, velocidad y subtítulos (el resumen de la lección). Retoma donde quedaste.
9. **Contenido sin inventar personas.** Docentes y universidades van como `[DOCENTE A] · [UNIVERSIDAD]`. Las lecciones sin contenido dicen "En producción".
10. **Se mantiene la dirección visual "plano técnico".**
    - Tinta, acento #2448C8, estados con letra y sin sombras ni degradados.
    - Space Grotesk / IBM Plex Sans / IBM Plex Mono.
    - Movimiento de 150–250 ms que respeta `prefers-reduced-motion`.
11. **Accesibilidad.**
    - Zonas táctiles de al menos 44 px.
    - Radios nativos y fórmulas con MathML.
    - `aria-current` en la navegación, `aria-pressed` en filtros y autoevaluación, y `aria-expanded` en soluciones y temario.
    - Enlace "Saltar al contenido".
12. **Gráficos de Estadísticas.** Una sola serie en acento, con valor en la punta y tooltip al pasar. La línea de aprobación del 75% está marcada en los tests.

Las decisiones de la versión anterior siguen vigentes en el diagnóstico, el perfil, la ruta y la vista docente: incertidumbre visible, sin cronómetro, sin rótulos "en riesgo" y cifras citadas.

## Qué es mock y qué hay que conectar

| Pieza | En el prototipo | Lo que habría que construir |
|---|---|---|
| **Videos** | Reproductor simulado (×20) con la fórmula de la lección como portada; subtítulos = resumen | Grabaciones reales, hosting de video con streaming adaptativo, subtítulos y transcripción reales, y métricas de visualización en el servidor |
| **Contenido** | 16 lecciones completas y 8 "en producción"; docentes como placeholders | Guion y revisión pedagógica de cada lección y un banco más amplio de ejercicios por lección |
| **Tests** | 4 preguntas fijas; el reintento repite las mismas y el perfil usa el último intento | Banco de ítems con variantes, para que cada reintento use preguntas nuevas; calibración de dificultad |
| **Avance** | `localStorage` (`puente:progreso`), un solo dispositivo | Cuentas, base de datos, sincronización entre dispositivos y registro de eventos para analítica |
| **Diagnóstico adaptativo** | 8 ítems fijos en orden fijo | Banco calibrado de 35–45 ítems, selección por ganancia de información y criterio de parada por precisión |
| **Modelo de dominio** | Reglas Beta sobre el grafo; tests con medio peso (`lib/profile.ts`) | Modelo cognitivo-diagnóstico o BKT/red bayesiana con matriz Q validada y parámetros estimados con datos chilenos |
| **Recomendador** | Orden topológico con prioridades (`lib/route.ts`) | Ponderar impacto, costo estimado y calendario; incorporar el comportamiento real en los módulos |
| **Vista docente** | 28 estudiantes ficticios | Datos reales por sección, permisos por rol y la actividad de los módulos en el panel |
| **Placeholders** | `[NOMBRE]`, `[DOCENTE A]`, `[UNIVERSIDAD]`, `[SECCIÓN]`, `[AÑO]`, `[CORREO DE CONTACTO]`, etc. | Completar con datos reales |
