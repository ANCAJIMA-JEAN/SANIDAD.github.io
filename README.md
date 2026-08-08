# SISTEMA SANIDAD — Control de Avance de Labores

Sistema web completo y funcional para registrar y hacer seguimiento a las
labores del Área de Sanidad: registro de labores, avances históricos por
fecha, mapas de ejecución en Google Drive, consolidados automáticos
(Jornales, Hectáreas, Jr/Ha, Ha/Jr) y filtros de búsqueda.

---

## 1. Objetivo

Permitir que cualquier persona, desde el celular, tablet o computador,
abra un enlace público, registre una labor y sus avances diarios, suba
mapas de ejecución, y consulte en cualquier momento el histórico completo
y el consolidado automático de cada labor — sin instalar nada.

## 2. Arquitectura

```
Navegador (HTML/CSS/JS puro)
        │  fetch() — JSON
        ▼
Google Apps Script (Web App / API REST)
        │
        ├── Google Sheets   → base de datos (LABORES, AVANCES, listas maestras)
        └── Google Drive    → almacenamiento de mapas/fotos de avance
```

- **Frontend**: HTML5 + CSS3 + JavaScript puro (sin frameworks), publicado
  en GitHub Pages. Solo conoce la URL pública de la API.
- **Backend/API**: un único Web App de Google Apps Script (`Code.gs`) que
  expone acciones vía `doGet` (lecturas) y `doPost` (escrituras).
- **Base de datos**: Google Sheets (`BD_SISTEMA_SANIDAD`), con una hoja
  por entidad.
- **Almacenamiento de imágenes**: Google Drive, carpeta
  `SISTEMA_SANIDAD/MAPAS_AVANCE/<año>/<mes>/`.

Regla de oro: **nunca se sobrescribe el histórico**. Cada nuevo avance crea
una fila nueva en `AVANCES`; los avances anteriores nunca se tocan.

---

## 3. Estructura del proyecto

```
sistema-sanidad/
│
├── index.html              # Todas las pantallas (Inicio, Registrar, Mis Labores, Continuar, Resumen)
├── css/
│   └── styles.css          # Estilos (mobile-first, verde/azul oscuro/blanco/gris)
├── js/
│   ├── api.js               # Comunicación con la API de Apps Script
│   ├── ui.js                # Navegación, toasts, loaders, compresión de imágenes
│   ├── labor.js              # Formulario "Registrar Labor"
│   ├── avances.js            # "Mis Labores" (filtros), "Continuar Avance", "Ver Resumen"
│   └── app.js                # Inicialización general
├── apps-script/
│   └── Code.gs               # Backend completo (pegar en Google Apps Script)
├── assets/
│   ├── logo/
│   └── icons/
├── README.md
└── .gitignore
```

---

## 4. Configuración de Google Sheets

1. Crea una hoja de cálculo de Google nueva y renómbrala:
   **`BD_SISTEMA_SANIDAD`**.
2. No necesitas crear las hojas ni encabezados manualmente: la función
   `setupSistema()` del backend los crea automáticamente (ver sección 6).

Las hojas que se crean son:

**LABORES**
| ID_LABOR | Fecha_Inicio | Responsable | Sector | Labor | Descripcion | Estado | Fecha_Creacion | Usuario_Registro |

**AVANCES**
| ID_AVANCE | ID_LABOR | Fecha | Jornales | Hectareas | Jr_Ha | Ha_Jr | ID_MAPA | URL_MAPA | Fecha_Registro |

**RESPONSABLES**
| ID_RESPONSABLE | Nombre | Area | Activo |

**SECTORES**
| ID_SECTOR | Sector | Activo | — datos iniciales: O1E1, O1E2, O2E1, O2E2, O3E1, O3E2, GENERAL |

**TIPOS_LABOR**
| ID_LABOR_TIPO | Labor | Activo | — con registros de ejemplo para poder probar |

**CONFIGURACION**
| Clave | Valor | — nombre del sistema, versión, carpetas de Drive, etc. |

---

## 5. Configuración de Google Drive

No requiere configuración manual. El backend crea automáticamente, dentro
de "Mi unidad" de la cuenta que ejecuta el script:

```
SISTEMA_SANIDAD/
└── MAPAS_AVANCE/
    └── 2026/
        └── AGOSTO/
            ├── AV-0001_O2E1_2026-08-08.jpg
            └── AV-0002_O2E1_2026-08-09.jpg
```

Cada imagen se comparte automáticamente como "Cualquiera con el enlace –
Lector" para que pueda visualizarse desde el frontend sin exponer la
cuenta de Drive.

---

## 6. Configuración y despliegue de Apps Script (backend)

1. Abre la hoja `BD_SISTEMA_SANIDAD` → **Extensiones → Apps Script**.
2. Borra el contenido de `Code.gs` que aparece por defecto y pega el
   contenido completo de `apps-script/Code.gs` de este repositorio.
3. En el editor, selecciona la función `setupSistema` en el desplegable de
   funciones (arriba) y presiona **Ejecutar**.
   - La primera vez te pedirá autorizar permisos (Sheets y Drive). Acepta.
   - Esto crea todas las hojas, encabezados, datos iniciales (sectores,
     responsables y labores de ejemplo) y las carpetas en Drive.
4. Verifica en el Sheet que las hojas y datos se crearon correctamente.

### Publicar como aplicación web (API pública)

1. En el editor de Apps Script: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Configuración:
   - Descripción: `API Sistema Sanidad v1`
   - Ejecutar como: **Yo (tu cuenta)**
   - Quién tiene acceso: **Cualquier usuario**
4. Presiona **Implementar** y copia la **URL de la aplicación web**
   (termina en `/exec`).

Cada vez que modifiques `Code.gs`, debes crear una **Nueva versión** desde
"Gestionar implementaciones" (o Implementar → Nueva implementación) para
que los cambios se reflejen en la URL pública.

---

## 7. Configuración de la URL del backend en el frontend

Abre `js/api.js` y reemplaza:

```js
const CONFIG = {
  API_URL: 'PEGA_AQUI_TU_URL_DE_APPS_SCRIPT'
};
```

por la URL copiada en el paso anterior, por ejemplo:

```js
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycb.../exec'
};
```

No se necesita ninguna otra clave ni credencial en el frontend: toda la
lógica sensible vive únicamente dentro de Apps Script.

---

## 8. Configuración de GitHub

```bash
git init
git add .
git commit -m "Sistema Sanidad — versión inicial"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/sistema-sanidad.git
git push -u origin main
```

## 9. Publicación con GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: `main` / carpeta `/ (root)`.
4. Guarda. En unos minutos el sistema estará disponible en:
   `https://<tu-usuario>.github.io/sistema-sanidad/`

Ese es el enlace público que los usuarios de campo abrirán desde el
celular, tablet o computador, sin instalar nada.

---

## 10. Mantenimiento

- **Agregar un responsable**: agrega una fila en la hoja `RESPONSABLES`
  con `Activo = TRUE`. Aparecerá automáticamente en el formulario.
- **Agregar un sector**: agrega una fila en `SECTORES` con `Activo = TRUE`.
- **Agregar un tipo de labor**: agrega una fila en `TIPOS_LABOR` con
  `Activo = TRUE`.
- **Desactivar sin borrar histórico**: cambia `Activo` a `FALSE` en vez de
  eliminar la fila (los avances históricos ya guardados no se afectan).
- **Nunca edites manualmente** las hojas `LABORES` o `AVANCES` para
  "corregir" un avance pasado: la regla del sistema es no sobrescribir el
  histórico. Si es necesario, coordina un ajuste como un avance adicional.
- **Actualizar el backend**: edita `Code.gs` en el editor de Apps Script y
  crea una **Nueva versión** de la implementación (ver sección 6).

---

## 11. Resumen de la API (Apps Script)

**GET** (lecturas) — `?action=...`

| Acción | Parámetros | Descripción |
|---|---|---|
| `ping` | — | Verifica que la API esté activa |
| `getResponsables` | — | Lista de responsables activos |
| `getSectores` | — | Lista de sectores activos |
| `getTiposLabor` | — | Lista de tipos de labor activos |
| `getLabores` | `q`, `labor`, `responsable`, `sector` | Tarjetas de labores con consolidado, filtradas |
| `getLaborById` | `id_labor` | Detalle completo: cabecera, avances y consolidado |

**POST** (escrituras) — body `{ action, payload }`

| Acción | Payload | Descripción |
|---|---|---|
| `createLabor` | fecha, responsable, sector, labor, descripcion, jornales, hectareas, imagenBase64 | Crea labor + primer avance |
| `createAdvance` | id_labor, fecha, jornales, hectareas, imagenBase64 | Crea un nuevo avance sobre una labor existente |

El backend **recalcula siempre** Jr/Ha y Ha/Jr en el servidor — nunca
confía en los valores enviados desde el navegador — y valida todos los
campos obligatorios antes de guardar.

---

## 12. Pruebas recomendadas

1. Crear una nueva labor con su primer avance y mapa.
2. Confirmar que el mapa aparece en Google Drive (`SISTEMA_SANIDAD/MAPAS_AVANCE/...`).
3. Confirmar que la fila aparece en `LABORES` y `AVANCES` de Google Sheets.
4. Usar "Continuar avance" sobre esa misma labor y guardar un segundo avance.
5. Confirmar que el primer avance **no se modificó**.
6. Registrar un tercer avance y confirmar que los tres pertenecen al mismo `ID_LABOR`.
7. Abrir "Ver resumen" y comprobar el consolidado (suma de jornales/hectáreas, no promedio de ratios).
8. Probar los filtros por Labor, Responsable y Sector, combinados.
9. Ampliar mapas desde la galería de "Mapas de ejecución".
10. Repetir todo el flujo desde un celular real.

---

## 13. Notas de seguridad

- El frontend público (GitHub) **no contiene** IDs de carpetas, tokens ni
  credenciales: solo la URL pública del Web App.
- Toda validación de negocio (campos obligatorios, jornales/hectáreas > 0,
  cálculo de ratios) se repite **en el backend**, por lo que no puede
  eludirse manipulando el frontend.
- Las imágenes se comparten en Drive únicamente como "cualquiera con el
  enlace puede ver", nunca editar.
