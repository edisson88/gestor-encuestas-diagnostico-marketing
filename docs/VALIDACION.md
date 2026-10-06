# Verificación del proyecto

## Comprobaciones realizadas

- Generación de Prisma Client y compilación TypeScript de la API.
- Compilación de producción del frontend React con Vite.
- 15 pruebas automatizadas aprobadas: definición de 64 preguntas, códigos, límites y exclusividad de selecciones, prioridades sin duplicados, salto D, canales desconocidos y otros canales, omisiones, denominadores, acceso a aplicaciones ajenas, conflictos de revisión, correcciones con motivo y CSV.
- Prueba de integración con una base PostgreSQL temporal compatible mediante PGlite: esquema SQL, seed, login, aceptación obligatoria, creación, guardado, conflicto de revisión, finalización, corrección y auditoría, exportación, separación piloto/definitiva y restricciones del aplicador.
- Revisión de dependencias con npm audit sin vulnerabilidades reportadas al preparar esta entrega.

La base temporal se utilizó únicamente para verificar el código. No está incluida como alternativa de almacenamiento en la app, no guarda datos reales y no sustituye la comprobación con Neon.

## Pendiente al configurar

- Conexión real con su proyecto Neon y ejecución de migraciones allí.
- Verificación visual y recorrido completo en navegador de escritorio y celular: el navegador automatizado del entorno no pudo completar su inicialización. El frontend compila; esta limitación no representa una aprobación visual del producto.
- Probar pérdida de conexión y recuperación del borrador guardado desde otro dispositivo.
- Despliegue Railway/Vercel, sus variables y CORS.
- Revisión por expertos, piloto comunitario e información institucional de participación.

## Recorrido manual sugerido

1. Crear administrador y un aplicador.
2. Configurar los seis campos STUDY_*.
3. Crear VR-TEST en fase PILOT, aceptar participación y recorrer A–H.
4. Verificar las 64 preguntas, sus campos Otra y D1 Otro canal utilizado.
5. Elegir Ninguna junto a una barrera: la selección exclusiva debe sustituir las demás.
6. Identificar todos los canales D1 como inexistentes/inactivos y dejar vacío Otro canal utilizado: se omiten D2–D9. Con un canal activo, desconocido u otro canal utilizado, se mantienen.
7. Guardar, recargar, ingresar nuevamente y continuar desde Registros.
8. Abrir el mismo borrador en dos sesiones y comprobar que una revisión antigua no sobrescriba cambios.
9. Finalizar con algunas omisiones y verificar conteos, CSV y separación de fases.
10. Corregir desde administrador con motivo y revisar Historial.
11. Crear una actividad del plan desde una prioridad y completar sus campos.
12. Repetir en celular, sin usar datos personales reales durante las pruebas.
