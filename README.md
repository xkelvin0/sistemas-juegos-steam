# Sistemas Juegos Steam

Colección de sistemas interactivos, checklists y herramientas de completado al 100% para videojuegos de Steam, diseñados con arquitecturas de alto rendimiento ($O(1)$ en memoria y tiempo), persistencia local permanente e interfaces optimizadas.

---

## 🎮 Proyectos Disponibles

### [Far Cry 5 — Tracker Maestro 100% Hope County](./farcry%205/)
Sistema integral de seguimiento de progreso y completado del 100% para **Far Cry 5** (Steam AppID `552520`).

- **Cobertura de Contenido**:
  - **448 Objetivos de Campaña y DLCs**: 65 misiones principales, 45 secundarias, 28 alijos de preparacionista, 21 puestos del culto, 43 propiedades del culto, 8 acrobacias de Clutch Nixon, 9 especialistas, 12 récords de pesca difícil (Old Betsy), 68 coleccionables, 50 talentos, 69 desafíos y 30 objetivos de las 3 expansiones (*Hours of Darkness*, *Lost on Mars*, *Dead Living Zombies*).
  - **72 Logros Oficiales de Steam**: Sincronización automática con las misiones y alijos vinculados.
- **Características Técnicas**:
  - **Motor Bitset de Alto Rendimiento**: Ponderación global calculada en $O(1)$ mediante manipulación de bits (`Uint32Array`), sin sobrecarga en el DOM ni recolección de basura innecesaria.
  - **Persistencia Local Síncrona**: Auto-guardado en `localStorage` con serialización hexadecimal compacta (~200 bytes).
  - **Sincronización Multi-Pestaña en Vivo**: Conexión reactiva vía `StorageEvent` para reflejar cambios en múltiples ventanas instantáneamente.
  - **Ilustraciones Vectoriales Locales (SVG)**: 8 pósters vectoriales temáticos de alta resolución sin dependencia de redes externas ni bloqueos CORS.
  - **Atajos de Teclado**: Navegación rápida con `Alt+1/2/3`, foco en búsqueda con `/` y limpieza con `Esc`.
  - **Importación y Exportación JSON**: Respaldo completo del progreso portable e independiente del navegador.

---

## 🚀 Despliegue Rápido

Para utilizar cualquiera de los trackers localmente:
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/xkelvin0/sistemas-juegos-steam.git
   ```
2. Abrir directamente `index.html` en el navegador (o ingresar a la carpeta de cada juego, ej. `farcry 5/index.html`). No requiere servidores web externos ni instalación de dependencias para su ejecución.
