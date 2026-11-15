import { ChangeDetectionStrategy, Component, type OnInit, computed, inject, signal } from '@angular/core';
import {
  type CategoryProgressSnapshot,
  CompletionEngineService,
  type RegionProgressSnapshot,
  type SteamScopeProgressSnapshot,
} from '../core/completion-engine.service.ts';
import {
  type CompletionFilterStatus,
  type ContentCategory,
  type ContentItem,
  type DlcScope,
  type ItemId,
  type RegionId,
  type SteamAchievement,
  type SteamAchievementId,
  type TrackerError,
} from '../domain/models.ts';

@Component({
  selector: 'fc5-tracker-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="fc5-dashboard">
      <header class="fc5-header">
        <h1>Far Cry 5 — Sistema 100% (Hope County + DLCs + Steam AppID 552520)</h1>
        <div class="fc5-metrics-grid">
          <article class="metric-card">
            <span>Progreso Real Ponderado</span>
            <strong>{{ metrics().true100Percentage.toFixed(2) }}%</strong>
          </article>
          <article class="metric-card">
            <span>Contenido In-Game + DLCs</span>
            <strong>
              {{ metrics().contentCompleted }} / {{ metrics().contentTotal }}
              ({{ metrics().contentPercentage.toFixed(1) }}%)
            </strong>
          </article>
          <article class="metric-card">
            <span>Logros Steam (72)</span>
            <strong>
              {{ metrics().steamUnlocked }} / {{ metrics().steamTotal }}
              ({{ metrics().steamPercentage.toFixed(1) }}%)
            </strong>
          </article>
        </div>
      </header>

      @if (activeError(); as errObj) {
        <section class="fc5-error-banner" role="alert">
          <strong>Error [{{ errObj.code }}]:</strong>
          <span>{{ formatError(errObj) }}</span>
        </section>
      }

      <section class="fc5-regions">
        <h2>Control Regional y Puntos de Resistencia (RP)</h2>
        <div class="region-grid">
          @for (region of regionList(); track region.regionId) {
            <article class="region-card">
              <h3>{{ region.name }} ({{ region.herald }})</h3>
              <p>
                Ítems: {{ region.completedCount }} / {{ region.totalCount }}
                ({{ region.percentage.toFixed(1) }}%)
              </p>
              @if (region.maxRp > 0) {
                <p>
                  RP: {{ region.currentRp }} / {{ region.maxRp }}
                  — Nivel {{ region.resistanceLevel }}/3
                </p>
              }
            </article>
          }
        </div>
      </section>

      <section class="fc5-filters">
        <h2>Checklist Interactivo de Contenido (448 Objetivos)</h2>
        <div class="filter-bar">
          <input
            type="search"
            placeholder="Buscar misión, escondite, pez, ubicación..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />

          <select
            aria-label="Filtro de Estado"
            [value]="selectedStatus()"
            (change)="onStatusChange($event)"
          >
            <option value="ALL">Todos (Completados y Pendientes)</option>
            <option value="PENDING">Solo Pendientes (Lo que me falta)</option>
            <option value="COMPLETED">Solo Completados</option>
          </select>

          <select
            aria-label="Filtro de Región"
            [value]="selectedRegion()"
            (change)="onRegionChange($event)"
          >
            <option value="ALL">Todas las Regiones y DLCs</option>
            @for (region of regionList(); track region.regionId) {
              <option [value]="region.regionId">{{ region.name }}</option>
            }
          </select>

          <select
            aria-label="Filtro de Categoría"
            [value]="selectedCategory()"
            (change)="onCategoryChange($event)"
          >
            <option value="ALL">Todas las Categorías</option>
            @for (cat of categoryList(); track cat.category) {
              <option [value]="cat.category">
                {{ cat.category }} ({{ cat.completedCount }}/{{ cat.quota }})
              </option>
            }
          </select>
        </div>

        <ul class="item-list">
          @for (item of filteredItems(); track item.id) {
            <li class="item-row">
              <label>
                <input
                  type="checkbox"
                  [checked]="isCompleted(item.id)"
                  (change)="onToggleItem(item.id)"
                />
                <span class="item-title">[{{ item.category }}] {{ item.title }}</span>
              </label>
              <small class="item-hint">{{ item.locationHint }}</small>
              @if (item.rpReward > 0) {
                <span class="badge-rp">+{{ item.rpReward }} RP</span>
              }
              @if (item.requiredRp !== undefined) {
                <span class="badge-req">Req: {{ item.requiredRp }} RP</span>
              }
              @if (item.missableWarning !== undefined) {
                <span class="badge-warn">{{ item.missableWarning }}</span>
              }
            </li>
          }
        </ul>
      </section>

      <section class="fc5-steam">
        <h2>Logros Oficiales de Steam (72 Totales: Base + NG+ + 3 DLCs)</h2>
        <div class="filter-bar">
          <select
            aria-label="Filtro de Alcance Steam"
            [value]="selectedSteamScope()"
            (change)="onSteamScopeChange($event)"
          >
            <option value="ALL">Todos los Alcances (72)</option>
            @for (scopeSnap of steamScopeList(); track scopeSnap.scope) {
              <option [value]="scopeSnap.scope">
                {{ scopeSnap.scope }} ({{ scopeSnap.unlockedCount }}/{{ scopeSnap.quota }})
              </option>
            }
          </select>
        </div>

        <ul class="item-list">
          @for (ach of filteredAchievements(); track ach.id) {
            <li class="item-row">
              <label>
                <input
                  type="checkbox"
                  [checked]="isAchievementUnlocked(ach.id)"
                  (change)="onToggleAchievement(ach.id)"
                />
                <span>[{{ ach.scope }}] <strong>{{ ach.title }}</strong> — {{ ach.description }}</span>
              </label>
            </li>
          }
        </ul>
      </section>
    </main>
  `,
})
export class TrackerDashboardComponent implements OnInit {
  private readonly engine = inject(CompletionEngineService);

  public readonly selectedRegion = signal<RegionId | 'ALL'>('ALL');
  public readonly selectedCategory = signal<ContentCategory | 'ALL'>('ALL');
  public readonly selectedSteamScope = signal<DlcScope | 'ALL'>('ALL');
  public readonly selectedStatus = signal<CompletionFilterStatus>('ALL');
  public readonly searchQuery = signal<string>('');

  public readonly metrics = this.engine.globalMetrics;
  public readonly activeError = this.engine.lastError;

  public readonly regionList = computed<readonly RegionProgressSnapshot[]>(() =>
    Array.from(this.engine.regionProgress().values())
  );

  public readonly categoryList = computed<readonly CategoryProgressSnapshot[]>(() =>
    Array.from(this.engine.categoryProgress().values())
  );

  public readonly steamScopeList = computed<readonly SteamScopeProgressSnapshot[]>(() =>
    Array.from(this.engine.steamScopeProgress().values())
  );

  public readonly filteredItems = computed<readonly ContentItem[]>(() =>
    this.engine.getItemsByFilter(
      this.selectedRegion(),
      this.selectedCategory(),
      this.selectedStatus(),
      this.searchQuery()
    )
  );

  public readonly filteredAchievements = computed<readonly SteamAchievement[]>(() =>
    this.engine.getAchievementsByScope(
      this.selectedSteamScope(),
      this.selectedStatus(),
      this.searchQuery()
    )
  );

  public ngOnInit(): void {
    this.engine.hydrateFromStorage();
  }

  public isCompleted(itemId: ItemId): boolean {
    return this.engine.isItemCompleted(itemId);
  }

  public isAchievementUnlocked(achievementId: SteamAchievementId): boolean {
    return this.engine.isAchievementUnlocked(achievementId);
  }

  public onToggleItem(itemId: ItemId): void {
    this.engine.toggleItem(itemId);
  }

  public onToggleAchievement(achievementId: SteamAchievementId): void {
    this.engine.toggleSteamAchievement(achievementId);
  }

  public onSearchInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.searchQuery.set(target.value);
    }
  }

  public onStatusChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      const value = target.value;
      if (value === 'ALL' || value === 'PENDING' || value === 'COMPLETED') {
        this.selectedStatus.set(value);
      }
    }
  }

  public onRegionChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      const value = target.value;
      if (
        value === 'ALL' ||
        value === 'dutch_island' ||
        value === 'holland_valley' ||
        value === 'henbane_river' ||
        value === 'whitetail_mountains' ||
        value === 'compound' ||
        value === 'dlc_vietnam' ||
        value === 'dlc_mars' ||
        value === 'dlc_zombies'
      ) {
        this.selectedRegion.set(value);
      }
    }
  }

  public onCategoryChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      const value = target.value;
      if (
        value === 'ALL' ||
        value === 'STORY_MISSION' ||
        value === 'SIDE_MISSION' ||
        value === 'PREPPER_STASH' ||
        value === 'CULT_OUTPOST' ||
        value === 'CULT_PROPERTY' ||
        value === 'CLUTCH_NIXON' ||
        value === 'COLLECTIBLE' ||
        value === 'SPECIALIST' ||
        value === 'FISHING_RECORD' ||
        value === 'PERK' ||
        value === 'CHALLENGE' ||
        value === 'DLC_OBJECTIVE'
      ) {
        this.selectedCategory.set(value);
      }
    }
  }

  public onSteamScopeChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      const value = target.value;
      if (
        value === 'ALL' ||
        value === 'base' ||
        value === 'ng_plus' ||
        value === 'hours_of_darkness' ||
        value === 'lost_on_mars' ||
        value === 'dead_living_zombies'
      ) {
        this.selectedSteamScope.set(value);
      }
    }
  }

  public formatError(error: TrackerError): string {
    switch (error.code) {
      case 'ITEM_NOT_FOUND':
        return `Ítem no encontrado: ${error.itemId}`;
      case 'ACHIEVEMENT_NOT_FOUND':
        return `Logro no encontrado: ${error.achievementId}`;
      case 'PREREQUISITE_NOT_MET':
        return `Prerrequisitos pendientes: ${error.missingItemIds.join(', ')}`;
      case 'RP_THRESHOLD_NOT_MET':
        return `RP insuficientes en ${error.region}: ${String(error.currentRp)} / ${String(error.requiredRp)} RP`;
      case 'STORAGE_CORRUPTED':
        return `Almacenamiento corrupto: ${error.reason}`;
      case 'STEAM_SYNC_FAILED':
        return `Fallo de sincronización Steam: ${error.reason}`;
    }
  }
}
