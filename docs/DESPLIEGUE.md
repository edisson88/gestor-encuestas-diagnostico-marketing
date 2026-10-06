# Despliegue con Neon Railway y Vercel

No se ha publicado ningún servicio. Primero verificar el proyecto localmente y subirlo a un repositorio GitHub privado o elegido por el equipo. No subir `.env`, contraseñas ni exportaciones de participantes.

## Neon

Crear PostgreSQL y copiar dos cadenas: pooled para `DATABASE_URL` y direct para `DIRECT_URL`. Usar la rama/base destinada a este proyecto. La aplicación utiliza Prisma y PostgreSQL, no la API de administración de Neon.

## Railway

1. Crear servicio desde el repositorio.
2. Conservar Root Directory `/` (raíz). `railway.json` selecciona `Dockerfile.core`.
3. Configurar `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_TTL_SECONDS=14400`, `NODE_ENV=production` y las seis variables `STUDY_*`.
4. Configurar `FRONTEND_URL` con el origen exacto del frontend, por ejemplo `https://su-proyecto.vercel.app`, sin `/` al final. Para varios orígenes separarlos con comas. Nunca utilizar `*`.
5. Railway proporciona `PORT`; la API escucha en `0.0.0.0`.
6. La prepublicación ejecuta `npm run db:deploy`. El healthcheck es `/api/health`.
7. Crear el administrador y cargar instrumento con `npm run db:seed` en el entorno del servicio con las variables `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`. Alternativa: aplicar migración y seed desde su equipo con las mismas cadenas de la base de producción.
8. Retirar `ADMIN_PASSWORD` de las variables de producción después del seed. Conservar credenciales en el medio seguro elegido por el responsable. Para nuevas versiones, ejecutar el seed con esas variables temporalmente; nunca reemplaza contraseñas existentes.
9. Generar el dominio HTTPS de la API.

## Vercel

1. Importar el mismo repositorio y conservar Root Directory `/`.
2. El archivo `vercel.json` define instalación y compilación del paquete compartido y React; salida `web-app/dist`.
3. Definir `VITE_API_URL=https://su-api.up.railway.app/api` antes del build. Es una URL pública, no un secreto.
4. Publicar el frontend, copiar su origen a `FRONTEND_URL` de Railway y volver a desplegar la API.
5. Los cambios de `VITE_API_URL` necesitan un nuevo build del frontend.

## Comprobación final

- Abrir `/api/health` y verificar respuesta `ok`.
- Ingresar, crear un diagnóstico piloto de prueba, guardar y retomar desde otro navegador.
- Verificar que un aplicador no pueda consultar registros ajenos o resultados globales.
- Comprobar CSV y corregir una aplicación con motivo desde administrador.
- Probar en un celular y con conexión inestable antes de la visita.
- Borrar o distinguir explícitamente los registros de prueba antes de analizar. Esta versión no ofrece borrado de diagnósticos para proteger el historial; depuración de pruebas se realiza por un responsable en una base de pruebas separada.

Configurar copias/exportaciones de respaldo y accesos según el procedimiento acordado por el equipo. La disponibilidad y los costos dependen del plan contratado en cada proveedor.
