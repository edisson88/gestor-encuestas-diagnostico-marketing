# Diccionario y análisis

La fuente del diccionario es `packages/instrument/src/definition.json`. Todas las opciones se codifican como strings con índice desde cero; NO asumir que un número mayor representa mejor capacidad. Cada columna `_label` del CSV traduce el código. Consultar la definición al analizar.

- A1–A4: caracterización.
- B1–B9: clientes y prácticas.
- C1–C4: recursos.
- D1–D9: canales y uso digital. D1 tiene siete subcampos, índice 0 a 6.
- E1–E13: habilidad autopercibida. 0=no sabe hacerlo; 1=con ayuda; 2=por cuenta propia; 3=no sabe valorar.
- F1–F3: barreras.
- G1–G13: apoyo solicitado, 0=ningún apoyo, 1=poco, 2=bastante, 3=mucho, 4=no sé.
- G14: ranking de hasta tres códigos G1–G13 sin repetir.
- G15–G16: necesidades adicionales y cambio esperado.
- H1–H6: participación y disponibilidad.
- Campos `_other`: especificación de opción Otra o tema de formación F3.

Nunca recodificar No sé, No aplica o ausencia de respuesta como cero. En E, “No sé hacerlo” sí es una habilidad informada y se mantiene como categoría válida.

Los resultados se filtran por fase y versión y usan aplicaciones con estado COMPLETE. Los porcentajes por ítem se calculan sobre respuestas válidas, excluyendo omisiones, No sé y No aplica; esas exclusiones se muestran. Selecciones múltiples pueden sumar más de 100%. G14 usa participantes que respondieron al menos una prioridad. La primera prioridad se muestra adicionalmente.

En D1, el denominador de la vista es participantes con al menos un canal respondido. Cada combinación canal/opción se presenta; No sabe se mantiene explícito. Para análisis de cada canal con su propio denominador utilizar la exportación. D2–D9 se clasifican como salto solo cuando D1 está completo y todos los canales se identifican como No tiene o Tiene pero no usó. Un canal desconocido o un texto en D1 Otro canal utilizado no permite asumir inactividad.

El CSV incluye código, fase, versión, estado, revisión y fechas, notas, respuestas codificadas y etiquetas. D1 y selecciones múltiples se exportan como JSON en la columna codificada. Incluye borradores para control; filtrarlos antes del análisis académico. Las celdas que pueden interpretarse como fórmulas se prefijan con apóstrofo para reducir ejecución accidental en Excel; las respuestas originales permanecen en la base.

No existe puntuación total de madurez, validez psicométrica automática ni diagnóstico generado con IA. El equipo debe interpretar los hallazgos, anonimizar respuestas abiertas y acordar prioridades con la asociación.
