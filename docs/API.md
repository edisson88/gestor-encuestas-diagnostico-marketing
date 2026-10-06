# API y datos

Prefijo `/api`. La única ruta pública de lectura es `/health`; `/auth/login` permite iniciar sesión. Todas las demás requieren `Authorization: Bearer TOKEN`. El frontend conserva el token solo en memoria.

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | /auth/login | Público limitado | Correo y contraseña |
| GET | /auth/me | Equipo | Usuario actual |
| GET | /instruments/active | Equipo | Instrumento activo |
| GET | /instruments | Equipo | Versiones históricas |
| GET | /instruments/study | Equipo | Información de participación |
| GET | /diagnostics | Equipo | Admin: todos; aplicador: propios, hasta 1000 |
| POST | /diagnostics | Equipo | Crear borrador con aceptación |
| GET | /diagnostics/:id | Propietario o admin | Detalle y definición aplicada |
| PATCH | /diagnostics/:id | Propietario o admin | Guardar con revisión actual |
| POST | /diagnostics/:id/complete | Propietario o admin | Finalizar |
| GET | /diagnostics/:id/audit | Propietario o admin | Historial |
| GET | /reports/summary?phase=PILOT&version=1.0.0 | Admin | Resultados de finalizadas |
| GET | /reports/export.csv?phase=PILOT&version=1.0.0 | Admin | Exportación de todos los estados |
| GET | /plans?phase=PILOT&version=1.0.0 | Admin | Actividades de intervención |
| POST | /plans | Admin | Crear actividad |
| PATCH | /plans/:id | Admin | Editar actividad |
| GET | /users | Admin | Lista de accesos |
| POST | /users | Admin | Crear usuario |

## Modelo

- `User`: acceso y rol; contraseña hash scrypt con salt aleatorio.
- `InstrumentVersion`: definición JSON inmutable por versión y estado activo.
- `Diagnostic`: código de negocio, fase, estado, definición asociada, aceptación y texto mostrado, respuestas JSON, notas y revisión. Clave única negocio + fase + instrumento.
- `AuditLog`: quién cambió el diagnóstico, cuándo, antes/después y motivo de corrección.
- `Intervention`: prioridad y planificación, asociada a fase/versión.

Las preguntas no se duplican en una tabla por ítem: su definición queda en la instantánea de versión. JSONB conserva los códigos para exportación y análisis. D1 guarda un objeto por canal; selecciones múltiples y ranking son arrays; texto y selección única son strings. La validación del servidor rechaza opciones desconocidas y límites excedidos.

## Ejemplo de creación

```json
{"businessCode":"VR-001","instrumentId":"id_obtenido_de_instruments_active","phase":"PILOT","consent":true}
```

## Ejemplo de guardado

```json
{"revision":1,"answers":{"A1":"0","E1":"1","G14":["G5","G6"]},"notes":""}
```

Se envía el objeto completo de respuestas; no una mezcla parcial. La revisión devuelta se utiliza en el siguiente guardado. HTTP 409 requiere recargar y revisar antes de enviar nuevamente. Las aplicaciones finalizadas requieren rol ADMIN y un `reason` no vacío para PATCH. No se fuerza respuesta a todos los ítems.

Los endpoints de intervención reciben todos los campos del formulario; cadena vacía significa pendiente. `agreed=true` es una declaración del equipo de que existe acuerdo con la asociación, no una aprobación automática.
