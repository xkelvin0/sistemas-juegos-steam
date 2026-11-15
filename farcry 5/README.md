# Far Cry 5 — Tracker Maestro 100% Hope County

Aplicación web interactiva para el seguimiento riguroso y completado al 100% de **Far Cry 5** (Steam AppID `552520`), incluyendo campaña principal, sectores de los tres Heraldos y las 3 expansiones oficiales.

## 📋 Métricas y Alcance

- **448 Objetivos de Campaña y DLCs**:
  - 65 Misiones de Historia
  - 45 Misiones Secundarias
  - 28 Alijos de Preparacionista (Prepper Stashes)
  - 21 Puestos del Culto (Outposts)
  - 43 Propiedades del Culto (Silos, Santuarios, Torres)
  - 8 Acrobacias Clutch Nixon
  - 9 Especialistas (Guns/Fangs for Hire)
  - 12 Récords de Pesca Difícil (Caña Old Betsy)
  - 68 Coleccionables (Cromos, Encendedores, Cómics, Vinilos, Barriles, Muñecos)
  - 50 Talentos (Perks)
  - 69 Desafíos de Caza, Armas y Mundo
  - 30 Objetivos de DLCs (*Hours of Darkness*, *Lost on Mars*, *Dead Living Zombies*)
- **72 Logros Oficiales de Steam**

## ⚡ Especificaciones Técnicas

- **Persistencia**: `localStorage` mediante compresión bitset hexadecimal (`Uint32Array`), consumiendo < 200 bytes en disco.
- **Sincronización Reactiva**: Escucha eventos `storage` para sincronizar múltiples pestañas o monitores en tiempo real.
- **Sin Dependencias de Red**: Todos los estilos CSS y pósters vectoriales SVG están embebidos localmente en `assets/`.
- **Atajos de Teclado**:
  - `/` : Búsqueda rápida de tareas.
  - `Esc` : Limpiar filtros y búsqueda.
  - `Alt + 1` : Vista de Portadas de Regiones.
  - `Alt + 2` : Vista de Checklist Detallado.
  - `Alt + 3` : Vista de Logros de Steam.

## 🖥️ Ejecución

Abre `index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox, Brave, Safari).
