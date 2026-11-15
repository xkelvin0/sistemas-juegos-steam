import {
  CATEGORY_QUOTAS,
  FARCRY5_CATALOG,
  REGION_METADATA,
  STEAM_SCOPE_QUOTAS,
} from '../data/farcry5-catalog.ts';
import {
  type BitIndex,
  type CompletionFilterStatus,
  type ContentCategory,
  type DlcScope,
  type ItemId,
  type PersistedTrackerState,
  type RegionId,
  type SteamAchievementId,
  createResistancePoints,
  isPersistedState,
} from '../domain/models.ts';

const STORAGE_KEY = 'fc5_completion_state_v1' as const;
const CONTENT_WORD_COUNT = Math.ceil(FARCRY5_CATALOG.items.length / 32);
const STEAM_WORD_COUNT = Math.ceil(FARCRY5_CATALOG.steamAchievements.length / 32);

// Ilustraciones vectoriales locales por región (inmunes a bloqueos de red/403)
const REGION_CARDS_DATA: Readonly<Record<RegionId, { readonly bgImage: string; readonly badgeColor: string; readonly subtitle: string }>> = {
  dutch_island: {
    bgImage: './assets/images/dutch.svg',
    badgeColor: '#5c7cfa',
    subtitle: 'Prólogo y Refugio Inicial'
  },
  holland_valley: {
    bgImage: './assets/images/holland.svg',
    badgeColor: '#f59f00',
    subtitle: 'John Seed • El Valle de la Expiación'
  },
  henbane_river: {
    bgImage: './assets/images/henbane.svg',
    badgeColor: '#f783ac',
    subtitle: 'Faith Seed • Niebla y Flores de Gozo'
  },
  whitetail_mountains: {
    bgImage: './assets/images/whitetail.svg',
    badgeColor: '#38d9a9',
    subtitle: 'Jacob Seed • Cumbres y Manadas de Lobos'
  },
  compound: {
    bgImage: './assets/images/compound.svg',
    badgeColor: '#ffd43b',
    subtitle: 'Joseph Seed • El Edén y el Juicio Final'
  },
  dlc_vietnam: {
    bgImage: './assets/images/vietnam.svg',
    badgeColor: '#ff6b6b',
    subtitle: 'Hours of Darkness • Rescate en la Selva'
  },
  dlc_mars: {
    bgImage: './assets/images/mars.svg',
    badgeColor: '#da77f2',
    subtitle: 'Lost on Mars • Nick Rye y Hurk Espacial'
  },
  dlc_zombies: {
    bgImage: './assets/images/zombies.svg',
    badgeColor: '#82c91e',
    subtitle: 'Dead Living Zombies • Guiones de Guy Marvel'
  }
};

const CATEGORY_LABELS: Readonly<Record<ContentCategory, string>> = {
  STORY_MISSION: 'Misiones Historia',
  SIDE_MISSION: 'Misiones Secundarias',
  PREPPER_STASH: 'Escondites Preparacionista',
  CULT_OUTPOST: 'Puestos del Culto',
  CULT_PROPERTY: 'Propiedades del Culto',
  CLUTCH_NIXON: 'Clutch Nixon',
  COLLECTIBLE: 'Coleccionables',
  SPECIALIST: 'Especialistas (9)',
  FISHING_RECORD: 'Récords Pesca (Old Betsy)',
  PERK: 'Talentos / Perks (50)',
  CHALLENGE: 'Desafíos (69)',
  DLC_OBJECTIVE: 'Objetivos Internos DLCs',
};

const STEAM_SCOPE_LABELS: Readonly<Record<DlcScope, string>> = {
  base: 'Juego Base (50)',
  ng_plus: 'New Game+ Infamous (1)',
  hours_of_darkness: 'DLC 1: Hours of Darkness (7)',
  lost_on_mars: 'DLC 2: Lost on Mars (7)',
  dead_living_zombies: 'DLC 3: Dead Living Zombies (7)',
};

const popcount32 = (value: number): number => {
  let v = value - ((value >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
};

const hasBit = (bitset: Uint32Array, index: BitIndex): boolean => {
  const wordIndex = index >>> 5;
  const word = bitset[wordIndex];
  if (word === undefined) {
    return false;
  }
  return (word & (1 << (index & 31))) !== 0;
};

const setBit = (bitset: Uint32Array, index: BitIndex, enabled: boolean): void => {
  const wordIndex = index >>> 5;
  const current = bitset[wordIndex];
  if (current === undefined) {
    return;
  }
  const mask = 1 << (index & 31);
  bitset[wordIndex] = enabled ? current | mask : current & ~mask;
};

const countBits = (bitset: Uint32Array): number => {
  let total = 0;
  for (let i = 0; i < bitset.length; i += 1) {
    const word = bitset[i];
    if (word !== undefined) {
      total += popcount32(word);
    }
  }
  return total;
};

const bitsetToHex = (bitset: Uint32Array): string => {
  let hex = '';
  for (let i = 0; i < bitset.length; i += 1) {
    const word = bitset[i] ?? 0;
    hex += (word >>> 0).toString(16).padStart(8, '0');
  }
  return hex;
};

const hexToBitset = (hex: string, expectedWords: number): Uint32Array | null => {
  if (hex.length !== expectedWords * 8 || !/^[0-9a-fA-F]*$/.test(hex)) {
    return null;
  }
  const out = new Uint32Array(expectedWords);
  for (let i = 0; i < expectedWords; i += 1) {
    const parsed = Number.parseInt(hex.slice(i * 8, (i + 1) * 8), 16);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    out[i] = parsed >>> 0;
  }
  return out;
};

export const bootstrapTrackerApp = (): void => {
  let contentBitset: Uint32Array = new Uint32Array(CONTENT_WORD_COUNT);
  let steamBitset: Uint32Array = new Uint32Array(STEAM_WORD_COUNT);

  // Vistas: 'REGIONS' | 'CHECKLIST' | 'STEAM'
  let currentView: 'REGIONS' | 'CHECKLIST' | 'STEAM' = 'REGIONS';
  let selectedRegion: RegionId | 'ALL' = 'ALL';
  let selectedCategory: ContentCategory | 'ALL' = 'ALL';
  let selectedSteamScope: DlcScope | 'ALL' = 'ALL';
  let selectedStatus: CompletionFilterStatus = 'ALL';
  let searchQuery = '';
  let notificationTimer: ReturnType<typeof setTimeout> | null = null;

  const showNotification = (msg: string, type: 'info' | 'success' | 'error' = 'info'): void => {
    const banner = document.getElementById('error-banner');
    const text = document.getElementById('error-text');
    if (banner && text) {
      text.textContent = msg;
      banner.className = `alert-banner visible alert-${type}`;
      if (notificationTimer !== null) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
      }
      if (type !== 'error') {
        notificationTimer = setTimeout(() => {
          clearNotification();
        }, 5000);
      }
    }
  };

  const clearNotification = (): void => {
    const banner = document.getElementById('error-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
  };

  const showError = (msg: string): void => {
    showNotification(msg, 'error');
  };

  const clearError = (): void => {
    clearNotification();
  };

  const saveState = (): void => {
    try {
      const state: PersistedTrackerState = {
        version: 1,
        contentBitsetHex: bitsetToHex(contentBitset),
        steamBitsetHex: bitsetToHex(steamBitset),
        updatedAtEpochMs: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      showError('No se pudo guardar en localStorage.');
    }
  };

  const loadState = (): void => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!isPersistedState(parsed)) {
        return;
      }
      const cBits = hexToBitset(parsed.contentBitsetHex, CONTENT_WORD_COUNT);
      const sBits = hexToBitset(parsed.steamBitsetHex, STEAM_WORD_COUNT);
      if (cBits !== null && sBits !== null) {
        contentBitset = cBits;
        steamBitset = sBits;
      }
    } catch {
      showError('El estado guardado estaba corrupto; se inició limpio.');
    }
  };

  const getRegionRp = (regionId: RegionId): number => {
    const items = FARCRY5_CATALOG.itemsByRegion.get(regionId) ?? [];
    const maxRp = REGION_METADATA[regionId].maxRp;
    let total = 0;
    for (const item of items) {
      if (hasBit(contentBitset, item.bitIndex)) {
        total += item.rpReward;
      }
    }
    return maxRp > 0 ? Math.min(total, maxRp) : 0;
  };

  const reconcileSteamAchievements = (): void => {
    for (const ach of FARCRY5_CATALOG.steamAchievements) {
      if (ach.linkedItemIds.length === 0 || ach.scope === 'ng_plus') {
        continue;
      }
      let allDone = true;
      for (const itemId of ach.linkedItemIds) {
        const linked = FARCRY5_CATALOG.itemById.get(itemId);
        if (linked === undefined || !hasBit(contentBitset, linked.bitIndex)) {
          allDone = false;
          break;
        }
      }
      if (allDone) {
        setBit(steamBitset, ach.bitIndex, true);
      }
    }
  };

  const handleToggleContent = (itemId: ItemId): void => {
    const item = FARCRY5_CATALOG.itemById.get(itemId);
    if (item === undefined) {
      return;
    }
    const currentlyDone = hasBit(contentBitset, item.bitIndex);
    const nextState = !currentlyDone;

    if (nextState) {
      // Auto-resolver en cascada recursiva todos los prerrequisitos obligatorios de la historia
      const autoCompletedTitles: string[] = [];
      const resolvePrereqsRecursively = (targetId: ItemId): void => {
        const target = FARCRY5_CATALOG.itemById.get(targetId);
        if (target === undefined) return;
        for (const prereqId of target.prerequisites) {
          const prereq = FARCRY5_CATALOG.itemById.get(prereqId);
          if (prereq !== undefined && !hasBit(contentBitset, prereq.bitIndex)) {
            setBit(contentBitset, prereq.bitIndex, true);
            autoCompletedTitles.push(prereq.title);
            resolvePrereqsRecursively(prereqId);
          }
        }
      };

      resolvePrereqsRecursively(item.id);

      if (autoCompletedTitles.length > 0) {
        showNotification(
          `✓ Completado en cadena: Al marcar "${item.title}", se completaron automáticamente sus misiones previas obligatorias: [${autoCompletedTitles.join(', ')}].`,
          'success'
        );
      } else {
        clearNotification();
      }
    } else {
      clearNotification();
    }

    setBit(contentBitset, item.bitIndex, nextState);
    reconcileSteamAchievements();
    saveState();
    renderAll();
  };

  const handleToggleSteam = (achId: SteamAchievementId): void => {
    const ach = FARCRY5_CATALOG.achievementById.get(achId);
    if (ach === undefined) {
      return;
    }
    clearError();
    const nextState = !hasBit(steamBitset, ach.bitIndex);
    setBit(steamBitset, ach.bitIndex, nextState);
    saveState();
    renderAll();
  };

  const renderMetrics = (): void => {
    const cDone = countBits(contentBitset);
    const cTotal = FARCRY5_CATALOG.items.length;
    const cPct = (cDone / cTotal) * 100;

    const sDone = countBits(steamBitset);
    const sTotal = FARCRY5_CATALOG.steamAchievements.length;
    const sPct = (sDone / sTotal) * 100;

    const true100 = cPct * 0.8 + sPct * 0.2;

    const elTrue = document.getElementById('metric-true-100');
    const barTrue = document.getElementById('bar-true-100');
    const elContent = document.getElementById('metric-content');
    const barContent = document.getElementById('bar-content');
    const elSteam = document.getElementById('metric-steam');
    const barSteam = document.getElementById('bar-steam');

    if (elTrue) elTrue.textContent = `${true100.toFixed(2)}%`;
    if (barTrue) barTrue.style.width = `${true100.toFixed(2)}%`;
    if (elContent) elContent.textContent = `${String(cDone)} / ${String(cTotal)} (${cPct.toFixed(1)}%)`;
    if (barContent) barContent.style.width = `${cPct.toFixed(1)}%`;
    if (elSteam) elSteam.textContent = `${String(sDone)} / ${String(sTotal)} (${sPct.toFixed(1)}%)`;
    if (barSteam) barSteam.style.width = `${sPct.toFixed(1)}%`;
  };

  const renderRegions = (): void => {
    const grid = document.getElementById('region-grid');
    if (!grid) {
      return;
    }
    grid.innerHTML = '';

    const regionIds = Object.keys(REGION_METADATA) as readonly RegionId[];
    for (const regionId of regionIds) {
      const meta = REGION_METADATA[regionId];
      const visual = REGION_CARDS_DATA[regionId];
      const items = FARCRY5_CATALOG.itemsByRegion.get(regionId) ?? [];
      let done = 0;
      for (const item of items) {
        if (hasBit(contentBitset, item.bitIndex)) {
          done += 1;
        }
      }
      const pct = items.length === 0 ? 100 : (done / items.length) * 100;
      const currentRp = getRegionRp(regionId);
      const [t1, t2, t3] = meta.thresholds;
      const level =
        meta.maxRp === 0 ? 0 : currentRp >= t3 ? 3 : currentRp >= t2 ? 2 : currentRp >= t1 ? 1 : 0;

      const card = document.createElement('article');
      card.className = `region-card-poster${selectedRegion === regionId ? ' active' : ''}`;
      card.innerHTML = `
        <div class="poster-image-box" style="background-image: url('${visual.bgImage}');">
          <div class="poster-overlay">
            <span class="poster-badge" style="background: ${visual.badgeColor};">${meta.name}</span>
            <span class="poster-percentage">${pct.toFixed(0)}%</span>
          </div>
        </div>
        <div class="poster-content">
          <h3 class="poster-title">${meta.name}</h3>
          <p class="poster-herald">${meta.herald}</p>
          <div class="progress-track" style="height: 10px; margin: 8px 0;">
            <div class="progress-fill" style="width: ${pct.toFixed(1)}%"></div>
          </div>
          <div class="poster-stats">
            <span>Completados: <strong>${String(done)} / ${String(items.length)}</strong></span>
            ${meta.maxRp > 0 ? `<span>RP: <strong>${String(currentRp)} / ${String(meta.maxRp)}</strong> (Nv. ${String(level)}/3)</span>` : `<span>DLC / Sector Especial</span>`}
          </div>
          <button type="button" class="btn-enter-region">Abrir Lista de Tareas ➜</button>
        </div>
      `;
      card.addEventListener('click', () => {
        selectedRegion = regionId;
        currentView = 'CHECKLIST';
        const regSelect = document.getElementById('region-select') as HTMLSelectElement | null;
        if (regSelect) {
          regSelect.value = selectedRegion;
        }
        renderAll();
      });
      grid.appendChild(card);
    }
  };

  const renderViewTabs = (): void => {
    const navRegions = document.getElementById('nav-regions');
    const navChecklist = document.getElementById('nav-checklist');
    const navSteam = document.getElementById('nav-steam');

    const viewRegionsSection = document.getElementById('view-regions');
    const viewChecklistSection = document.getElementById('view-checklist');
    const viewSteamSection = document.getElementById('view-steam');

    if (navRegions) navRegions.className = `view-nav-btn${currentView === 'REGIONS' ? ' active' : ''}`;
    if (navChecklist) navChecklist.className = `view-nav-btn${currentView === 'CHECKLIST' ? ' active' : ''}`;
    if (navSteam) navSteam.className = `view-nav-btn${currentView === 'STEAM' ? ' active' : ''}`;

    if (viewRegionsSection) viewRegionsSection.style.display = currentView === 'REGIONS' ? 'flex' : 'none';
    if (viewChecklistSection) viewChecklistSection.style.display = currentView === 'CHECKLIST' ? 'flex' : 'none';
    if (viewSteamSection) viewSteamSection.style.display = currentView === 'STEAM' ? 'flex' : 'none';

    // Banner de cabecera contextual en checklist
    const regionBanner = document.getElementById('current-region-banner');
    if (regionBanner) {
      if (selectedRegion !== 'ALL') {
        const meta = REGION_METADATA[selectedRegion];
        const visual = REGION_CARDS_DATA[selectedRegion];
        regionBanner.style.display = 'block';
        regionBanner.style.backgroundImage = `linear-gradient(rgba(14,24,36,0.7), rgba(14,24,36,0.9)), url('${visual.bgImage}')`;
        regionBanner.innerHTML = `
          <div style="padding: 24px;">
            <span style="background: ${visual.badgeColor}; color: #fff; font-weight: 800; font-size: 0.8rem; padding: 4px 10px; border-radius: 4px;">ZONA SELECCIONADA</span>
            <h2 style="font-family: 'Teko', sans-serif; font-size: 2.8rem; color: #fff; margin: 4px 0;">${meta.name}</h2>
            <p style="color: #e2d7be; font-size: 0.95rem;">${meta.herald} • ${visual.subtitle}</p>
          </div>
        `;
      } else {
        regionBanner.style.display = 'none';
      }
    }
  };

  const renderPillsAndSelects = (): void => {
    const regSelect = document.getElementById('region-select') as HTMLSelectElement | null;
    const catSelect = document.getElementById('category-select') as HTMLSelectElement | null;
    const pillsContainer = document.getElementById('category-pills');

    if (regSelect) {
      regSelect.value = selectedRegion;
    }

    if (catSelect) {
      catSelect.innerHTML = '';
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = 'Categoría: Todas (448)';
      catSelect.appendChild(allOpt);

      const cats = Object.keys(CATEGORY_QUOTAS) as readonly ContentCategory[];
      for (const cat of cats) {
        const items = FARCRY5_CATALOG.itemsByCategory.get(cat) ?? [];
        let done = 0;
        for (const item of items) {
          if (hasBit(contentBitset, item.bitIndex)) done += 1;
        }
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `${CATEGORY_LABELS[cat]} (${String(done)}/${String(CATEGORY_QUOTAS[cat])})`;
        catSelect.appendChild(opt);
      }
      catSelect.value = selectedCategory;
    }

    if (pillsContainer) {
      pillsContainer.innerHTML = '';
      const cats = Object.keys(CATEGORY_QUOTAS) as readonly ContentCategory[];
      for (const cat of cats) {
        const items = FARCRY5_CATALOG.itemsByCategory.get(cat) ?? [];
        let done = 0;
        for (const item of items) {
          if (hasBit(contentBitset, item.bitIndex)) done += 1;
        }
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `cat-pill${selectedCategory === cat ? ' active' : ''}`;
        pill.textContent = `${CATEGORY_LABELS[cat]}: ${String(done)}/${String(CATEGORY_QUOTAS[cat])}`;
        pill.addEventListener('click', () => {
          selectedCategory = selectedCategory === cat ? 'ALL' : cat;
          renderAll();
        });
        pillsContainer.appendChild(pill);
      }
    }
  };

  const renderChecklist = (): void => {
    const list = document.getElementById('checklist-container');
    const counter = document.getElementById('results-counter');
    if (!list) {
      return;
    }
    list.innerHTML = '';
    const q = searchQuery.trim().toLowerCase();

    const filtered = FARCRY5_CATALOG.items.filter((item) => {
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      const done = hasBit(contentBitset, item.bitIndex);
      if (selectedStatus === 'COMPLETED' && !done) return false;
      if (selectedStatus === 'PENDING' && done) return false;
      if (q.length > 0) {
        return (
          item.title.toLowerCase().includes(q) ||
          item.locationHint.toLowerCase().includes(q) ||
          CATEGORY_LABELS[item.category].toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (counter) {
      counter.textContent = `Mostrando ${String(filtered.length)} de ${String(FARCRY5_CATALOG.items.length)} objetivos`;
    }

    for (const item of filtered) {
      const done = hasBit(contentBitset, item.bitIndex);
      const li = document.createElement('li');
      li.className = `check-row${done ? ' completed' : ''}`;

      const label = document.createElement('label');
      label.className = 'check-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = done;
      checkbox.addEventListener('change', () => {
        handleToggleContent(item.id);
      });

      const main = document.createElement('div');
      main.className = 'item-main';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'item-title';
      titleSpan.textContent = item.title;

      const hintSpan = document.createElement('span');
      hintSpan.className = 'item-hint';
      hintSpan.textContent = `📍 ${REGION_METADATA[item.region].name} — ${item.locationHint}`;

      main.appendChild(titleSpan);
      main.appendChild(hintSpan);

      if (item.missableWarning !== undefined) {
        const warnSpan = document.createElement('span');
        warnSpan.className = 'item-warn';
        warnSpan.textContent = `⚠️ ${item.missableWarning}`;
        main.appendChild(warnSpan);
      }

      label.appendChild(checkbox);
      label.appendChild(main);

      const badges = document.createElement('div');
      badges.className = 'badges';

      const catBadge = document.createElement('span');
      catBadge.className = 'badge badge-cat';
      catBadge.textContent = CATEGORY_LABELS[item.category];
      badges.appendChild(catBadge);

      if (item.rpReward > 0) {
        const rpBadge = document.createElement('span');
        rpBadge.className = 'badge badge-rp';
        rpBadge.textContent = `+${String(item.rpReward)} RP`;
        badges.appendChild(rpBadge);
      }

      if (item.requiredRp !== undefined) {
        const reqBadge = document.createElement('span');
        reqBadge.className = 'badge badge-req';
        reqBadge.textContent = `Req: ${String(item.requiredRp)} RP`;
        badges.appendChild(reqBadge);
      }

      li.appendChild(label);
      li.appendChild(badges);
      list.appendChild(li);
    }
  };

  const renderSteamList = (): void => {
    const steamList = document.getElementById('steam-container');
    const steamCounter = document.getElementById('steam-results-counter');
    const steamScopeSelect = document.getElementById('steam-scope-select') as HTMLSelectElement | null;
    if (!steamList) {
      return;
    }
    steamList.innerHTML = '';
    const q = searchQuery.trim().toLowerCase();

    if (steamScopeSelect && steamScopeSelect.options.length <= 1) {
      steamScopeSelect.innerHTML = '<option value="ALL">Todos los Alcances (72 Logros)</option>';
      const scopes = Object.keys(STEAM_SCOPE_QUOTAS) as readonly DlcScope[];
      for (const sc of scopes) {
        const opt = document.createElement('option');
        opt.value = sc;
        opt.textContent = STEAM_SCOPE_LABELS[sc];
        steamScopeSelect.appendChild(opt);
      }
    }

    const filtered = FARCRY5_CATALOG.steamAchievements.filter((ach) => {
      if (selectedSteamScope !== 'ALL' && ach.scope !== selectedSteamScope) return false;
      const done = hasBit(steamBitset, ach.bitIndex);
      if (selectedStatus === 'COMPLETED' && !done) return false;
      if (selectedStatus === 'PENDING' && done) return false;
      if (q.length > 0) {
        return (
          ach.title.toLowerCase().includes(q) ||
          ach.description.toLowerCase().includes(q) ||
          ach.apiName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (steamCounter) {
      steamCounter.textContent = `Mostrando ${String(filtered.length)} de 72 logros oficiales de Steam`;
    }

    for (const ach of filtered) {
      const done = hasBit(steamBitset, ach.bitIndex);
      const li = document.createElement('li');
      li.className = `check-row${done ? ' completed' : ''}`;

      const label = document.createElement('label');
      label.className = 'check-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = done;
      checkbox.addEventListener('change', () => {
        handleToggleSteam(ach.id);
      });

      const main = document.createElement('div');
      main.className = 'item-main';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'item-title';
      titleSpan.textContent = `🏆 ${ach.title}`;

      const descSpan = document.createElement('span');
      descSpan.className = 'item-hint';
      descSpan.textContent = `${ach.description} (${ach.apiName})`;

      main.appendChild(titleSpan);
      main.appendChild(descSpan);

      label.appendChild(checkbox);
      label.appendChild(main);

      const badges = document.createElement('div');
      badges.className = 'badges';
      const scopeBadge = document.createElement('span');
      scopeBadge.className = 'badge badge-cat';
      scopeBadge.textContent = STEAM_SCOPE_LABELS[ach.scope];
      badges.appendChild(scopeBadge);

      li.appendChild(label);
      li.appendChild(badges);
      steamList.appendChild(li);
    }
  };

  const renderAll = (): void => {
    renderMetrics();
    renderViewTabs();
    if (currentView === 'REGIONS') {
      renderRegions();
    } else if (currentView === 'CHECKLIST') {
      renderPillsAndSelects();
      renderChecklist();
    } else if (currentView === 'STEAM') {
      renderSteamList();
    }
  };

  // Selectores de navegación
  document.getElementById('nav-regions')?.addEventListener('click', () => {
    currentView = 'REGIONS';
    renderAll();
  });

  document.getElementById('nav-checklist')?.addEventListener('click', () => {
    currentView = 'CHECKLIST';
    renderAll();
  });

  document.getElementById('nav-steam')?.addEventListener('click', () => {
    currentView = 'STEAM';
    renderAll();
  });

  // Inicializar selectores de filtros
  const regSelect = document.getElementById('region-select') as HTMLSelectElement | null;
  if (regSelect) {
    regSelect.innerHTML = '<option value="ALL">Región: Todas (Hope County + DLCs)</option>';
    const regionIds = Object.keys(REGION_METADATA) as readonly RegionId[];
    for (const rId of regionIds) {
      const opt = document.createElement('option');
      opt.value = rId;
      opt.textContent = REGION_METADATA[rId].name;
      regSelect.appendChild(opt);
    }
    regSelect.addEventListener('change', () => {
      selectedRegion = regSelect.value as RegionId | 'ALL';
      renderAll();
    });
  }

  const catSelect = document.getElementById('category-select') as HTMLSelectElement | null;
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      selectedCategory = catSelect.value as ContentCategory | 'ALL';
      renderAll();
    });
  }

  const statusSelect = document.getElementById('status-select') as HTMLSelectElement | null;
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      selectedStatus = statusSelect.value as CompletionFilterStatus;
      renderAll();
    });
  }

  const steamScopeSelect = document.getElementById('steam-scope-select') as HTMLSelectElement | null;
  if (steamScopeSelect) {
    steamScopeSelect.addEventListener('change', () => {
      selectedSteamScope = steamScopeSelect.value as DlcScope | 'ALL';
      renderAll();
    });
  }

  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      if (currentView === 'CHECKLIST') {
        renderChecklist();
      } else if (currentView === 'STEAM') {
        renderSteamList();
      }
    });
  }

  document.getElementById('btn-close-error')?.addEventListener('click', () => {
    clearError();
  });

  document.getElementById('btn-mark-visible')?.addEventListener('click', () => {
    const q = searchQuery.trim().toLowerCase();
    for (const item of FARCRY5_CATALOG.items) {
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) continue;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) continue;
      if (
        q.length > 0 &&
        !item.title.toLowerCase().includes(q) &&
        !item.locationHint.toLowerCase().includes(q)
      ) {
        continue;
      }
      let canMark = true;
      for (const pId of item.prerequisites) {
        const pItem = FARCRY5_CATALOG.itemById.get(pId);
        if (pItem !== undefined && !hasBit(contentBitset, pItem.bitIndex)) {
          canMark = false;
          break;
        }
      }
      if (canMark && item.requiredRp !== undefined) {
        if (getRegionRp(item.region) < item.requiredRp) {
          canMark = false;
        }
      }
      if (canMark) {
        setBit(contentBitset, item.bitIndex, true);
      }
    }
    reconcileSteamAchievements();
    saveState();
    renderAll();
  });

  document.getElementById('btn-export')?.addEventListener('click', () => {
    const payload: PersistedTrackerState = {
      version: 1,
      contentBitsetHex: bitsetToHex(contentBitset),
      steamBitsetHex: bitsetToHex(steamBitset),
      updatedAtEpochMs: Date.now(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farcry5-100-progreso.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btn-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed: unknown = JSON.parse(String(reader.result));
          if (!isPersistedState(parsed)) {
            showError('El archivo JSON no tiene un formato válido.');
            return;
          }
          const cBits = hexToBitset(parsed.contentBitsetHex, CONTENT_WORD_COUNT);
          const sBits = hexToBitset(parsed.steamBitsetHex, STEAM_WORD_COUNT);
          if (!cBits || !sBits) {
            showError('Bitset hexadecimal corrupto en el archivo importado.');
            return;
          }
          contentBitset = cBits;
          steamBitset = sBits;
          saveState();
          clearError();
          renderAll();
        } catch {
          showError('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('¿Seguro que deseas reiniciar todo el progreso a 0%?')) {
      contentBitset = new Uint32Array(CONTENT_WORD_COUNT);
      steamBitset = new Uint32Array(STEAM_WORD_COUNT);
      saveState();
      clearError();
      renderAll();
    }
  });

  // Sincronización en tiempo real entre múltiples pestañas / ventanas
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue !== null) {
      loadState();
      renderAll();
    }
  });

  // Atajos de teclado para productividad de alto rendimiento
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    // Si el usuario escribe en un campo de texto, ignorar atajos de navegación
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (event.key === '/' && activeTag !== 'input' && activeTag !== 'textarea') {
      event.preventDefault();
      const sInput = document.getElementById('search-input') as HTMLInputElement | null;
      if (sInput) {
        if (currentView !== 'CHECKLIST' && currentView !== 'STEAM') {
          currentView = 'CHECKLIST';
          renderAll();
        }
        sInput.focus();
        sInput.select();
      }
      return;
    }

    if (event.key === 'Escape' && activeTag === 'input') {
      const sInput = document.getElementById('search-input') as HTMLInputElement | null;
      if (sInput) {
        sInput.value = '';
        searchQuery = '';
        sInput.blur();
        renderAll();
      }
      return;
    }

    if (event.altKey) {
      if (event.key === '1') {
        currentView = 'REGIONS';
        renderAll();
      } else if (event.key === '2') {
        currentView = 'CHECKLIST';
        renderAll();
      } else if (event.key === '3') {
        currentView = 'STEAM';
        renderAll();
      }
    }
  });

  loadState();
  renderAll();
};
