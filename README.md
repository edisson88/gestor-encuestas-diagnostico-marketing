# Diagnóstico de marketing de Villa Restrepo

Monorepo para aplicación presencial con internet. React + TypeScript en `web-app`, NestJS en `core-service-api`, PostgreSQL en Neon y Prisma 6.12.0 como ORM. La API está lista para conectar; no contiene credenciales ni respuestas de ejemplo. La conexión a Neon y el despliegue no han sido realizados.

## Requisitos

- Node.js 22 o 24 y npm 10 o superior.
- VS Code.
- Proyecto PostgreSQL en Neon con conexión pooled y conexión direct.

Prisma usa la conexión PostgreSQL de Neon. **No se necesita una clave de la API REST de Neon.**

## Iniciar en VS Code

1. Descomprimir y abrir la carpeta `villa-restrepo-diagnostico` completa en VS Code.
2. Abrir una terminal en la raíz, donde está este README.
3. Instalar y crear los archivos de configuración:

```bash
npm ci
npm run setup:env
```

4. Completar `core-service-api/.env`:

```dotenv
DATABASE_URL="postgresql://USUARIO:CLAVE@HOST-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USUARIO:CLAVE@HOST.neon.tech/neondb?sslmode=require"
JWT_SECRET="un_secreto_aleatorio_de_al_menos_32_caracteres"
ADMIN_EMAIL="su_correo"
ADMIN_PASSWORD="una_contrasena_de_al_menos_12_caracteres"
ADMIN_NAME="Su nombre"
```

Copiar ambas cadenas desde el panel de conexión de Neon, conservando todos sus parámetros. Los valores de ejemplo no conectan. Para generar el secreto:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Completar también `STUDY_INSTITUTION`, `STUDY_RESPONSIBLE`, `STUDY_CONTACT`, `STUDY_DATA_ACCESS`, `STUDY_CUSTODY` y `STUDY_RETENTION`: son los datos que se informan al participante. Sin ellos el formulario no permite recoger respuestas. Mantener `PORT=3000` y `FRONTEND_URL=http://localhost:5173` en desarrollo.

5. En `web-app/.env` mantener:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

6. Crear las tablas y el usuario inicial:

```bash
npm run build -w @vr/instrument
npm run db:generate
npm run db:deploy
npm run db:seed
```

`db:deploy` aplica la migración inicial incluida. El seed carga el instrumento de 64 preguntas y crea el administrador. Puede ejecutarse otra vez: no borra respuestas ni cambia contraseñas existentes. No crea registros ficticios.

7. Ejecutar:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Salud: http://localhost:3000/api/health

Ingresar con `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Crear accesos de aplicadores desde **Equipo**. El backend requiere una conexión válida a la base al iniciar.

Si desea iniciar por separado, primero compile `@vr/instrument` y ejecute en dos terminales:

```bash
npm run dev -w core-service-api
npm run dev -w web-app
```

## Funciones incluidas

- Inicio con cifras reales de los registros visibles.
- Consentimiento informado con datos institucionales configurables.
- Todas las preguntas A–H: 64 ítems, incluyendo siete canales en D1.
- Grupos de hasta tres preguntas, opciones múltiples limitadas y textos de hasta 2.000 caracteres.
- Salto D2–D9 si todos los canales se identifican como inexistentes o inactivos. Una categoría desconocida o un texto en Otro canal utilizado no prueba inactividad y mantiene las preguntas visibles.
- Guardado explícito en servidor; el botón Siguiente guarda los cambios antes de avanzar.
- Borradores retomables desde Registros, en otros dispositivos con sesión autorizada.
- Finalización con omisiones voluntarias: completo significa aplicación finalizada, no todas las preguntas contestadas.
- Administrador: todos los registros, resultados, exportación CSV, actividades de intervención, usuarios y correcciones justificadas.
- Aplicador: sus propias aplicaciones y su historial.
- Auditoría de creación, guardados, finalización y correcciones; control de revisión para evitar sobrescritura simultánea.
- Tablero por fase y versión; no mezcla piloto y aplicación definitiva.
- CSV en UTF-8 con códigos y etiquetas, sin nombres de aplicadores; incluye borradores y estado para que puedan excluirse en el análisis.
- Plan de intervención editable con hallazgo, objetivo, actividad, producto, recursos, fecha, indicador, línea base, meta y verificación.

No hay almacenamiento de respuestas en el navegador: ni localStorage, ni IndexedDB, ni service worker. Las respuestas pendientes están en memoria mientras la página siga abierta. Si se pierde internet, se informa el fallo; cerrar, recargar o vencer la sesión puede perder lo no guardado. La sesión JWT también permanece en memoria y se debe volver a ingresar tras recargar. El servidor conserva los borradores guardados. La sesión dura cuatro horas por defecto.

## Validación y pruebas

```bash
npm run build
npm test
```

La compilación genera Prisma Client, el paquete del instrumento, la API y el frontend. Las pruebas cubren reglas del instrumento, denominadores, salto digital, permisos de propiedad, conflictos de revisión, correcciones y neutralización de fórmulas en CSV. Ver `docs/VALIDACION.md` para alcance y verificaciones realizadas.

## Cambiar el instrumento

La definición está en `packages/instrument/src/definition.json`. No editar una versión ya aplicada: incrementar `version`, compilar y ejecutar el seed. La definición anterior permanece en la base y cada aplicación usa su propia instantánea. El seed rechaza cambios de contenido bajo el mismo número de versión. Si modifica estructura del modelo de datos, crear una migración con `npm run db:migrate` en desarrollo y aplicar con `db:deploy` en producción.

`Instrumento_marketing_Villa_Restrepo_v1.docx` en `docs` es la referencia inicial para expertos. La implementación conserva el contenido y añade controles digitales, como exclusividad de “Ninguna” y ranking sin repeticiones. Revisar también esos controles durante el piloto.

## Despliegue

Ver `docs/DESPLIEGUE.md`. Incluye Dockerfile y configuración Railway/Vercel. Ambos servicios deben usar la **raíz del monorepo**, porque dependen de `packages/instrument` y del lockfile común. No es necesario publicar un paquete npm.

## Identidad institucional y límites

Paleta azul y amarillo alineada visualmente con el mockup. No se incluye un logotipo oficial ni se declara la app una plataforma oficial de la UNAD. Incorporar el archivo institucional autorizado en una revisión posterior. El instrumento es una primera versión no validada; la app no asigna índices de madurez ni inferencias causales. Revisar con expertos, realizar piloto y acordar metas con la comunidad.

Esta versión incluye creación de usuarios; no incluye autoservicio para recuperar/cambiar contraseña ni desactivación desde la interfaz. La desactivación puede realizarse por el responsable en Prisma Studio (`npx prisma studio` desde `core-service-api`). El cambio de contraseña requiere un procedimiento administrativo que genere un nuevo hash scrypt. No exponga Prisma Studio públicamente.

## Documentación técnica

- [API y modelo de datos](docs/API.md)
- [Despliegue](docs/DESPLIEGUE.md)
- [Validación](docs/VALIDACION.md)
- [Diccionario y análisis](docs/ANALISIS.md)

Referencias oficiales consultadas: [Prisma con Neon](https://docs.prisma.io/docs/orm/v6/overview/databases/neon), [NestJS y autorización](https://docs.nestjs.com/security/authorization), [Vercel monorepos](https://vercel.com/docs/monorepos), [Railway Dockerfiles](https://docs.railway.com/guides/dockerfiles).
