import { Injectable, computed, signal } from '@angular/core';
import {
  CATEGORY_QUOTAS,
  FARCRY5_CATALOG,
  REGION_METADATA,
  STEAM_APP_ID,
  STEAM_SCOPE_QUOTAS,
} from '../data/farcry5-catalog.ts';
import {
  type BitIndex,
  type CompletionFilterStatus,
  type ContentCategory,
  type ContentItem,
  type DlcScope,
  type ItemId,
  type PersistedTrackerState,
  type RegionId,
  type ResistancePoints,
  type Result,
  type SteamAchievement,
  type SteamAchievementId,
  type TrackerError,
  createResistancePoints,
  err,
  isPersistedState,
  isSteamAchievementResponse,
  ok,
} from '../domain/models.ts';

const STORAGE_KEY = 'fc5_completion_state_v1' as const;
const CONTENT_WORD_COUNT = Math.ceil(FARCRY5_CATALOG.items.length / 32);
const STEAM_WORD_COUNT = Math.ceil(FARCRY5_CATALOG.steamAchievements.length / 32);

export interface RegionProgressSnapshot {
  readonly regionId: RegionId;
  readonly name: string;
  readonly herald: string;
  readonly completedCount: number;
  readonly totalCount: number;
  readonly percentage: number;
  readonly currentRp: ResistancePoints;
  readonly maxRp: ResistancePoints;
  readonly resistanceLevel: 0 | 1 | 2 | 3;
}

export interface CategoryProgressSnapshot {
  readonly category: ContentCategory;
  readonly completedCount: number;
  readonly quota: number;
  readonly percentage: number;
}

export interface SteamScopeProgressSnapshot {
  readonly scope: DlcScope;
  readonly unlockedCount: number;
  readonly quota: number;
  readonly percentage: number;
}

export interface GlobalCompletionMetrics {
  readonly contentCompleted: number;
  readonly contentTotal: number;
  readonly contentPercentage: number;
  readonly steamUnlocked: number;
  readonly steamTotal: number;
  readonly steamPercentage: number;
  readonly true100Percentage: number;
}

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
  const mask = 1 << (index & 31);
  return (word & mask) !== 0;
};

const withBit = (bitset: Uint32Array, index: BitIndex, enabled: boolean): Uint32Array => {
  const next = new Uint32Array(bitset);
  const wordIndex = index >>> 5;
  const currentWord = next[wordIndex];
  if (currentWord === undefined) {
    return next;
  }
  const mask = 1 << (index & 31);
  next[wordIndex] = enabled ? currentWord | mask : currentWord & ~mask;
  return next;
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

const hexToBitset = (
  hex: string,
  expectedWords: number
): Result<Uint32Array, TrackerError> => {
  if (hex.length !== expectedWords * 8 || !/^[0-9a-fA-F]*$/.test(hex)) {
    return err({
      code: 'STORAGE_CORRUPTED',
      reason: `Longitud o formato hexadecimal inválido (esperado ${String(expectedWords * 8)} chars).`,
    });
  }
  const result = new Uint32Array(expectedWords);
  for (let i = 0; i < expectedWords; i += 1) {
    const slice = hex.slice(i * 8, (i + 1) * 8);
    const parsed = Number.parseInt(slice, 16);
    if (!Number.isFinite(parsed)) {
      return err({
        code: 'STORAGE_CORRUPTED',
        reason: `Palabra corrupta en índice ${String(i)}.`,
      });
    }
    result[i] = parsed >>> 0;
  }
  return ok(result);
};

@Injectable({ providedIn: 'root' })
export class CompletionEngineService {
  private readonly contentBitset = signal<Uint32Array>(new Uint32Array(CONTENT_WORD_COUNT));
  private readonly steamBitset = signal<Uint32Array>(new Uint32Array(STEAM_WORD_COUNT));
  private readonly lastErrorState = signal<TrackerError | null>(null);

  public readonly lastError = this.lastErrorState.asReadonly();

  public readonly regionProgress = computed<ReadonlyMap<RegionId, RegionProgressSnapshot>>(() => {
    const bits = this.contentBitset();
    const map = new Map<RegionId, RegionProgressSnapshot>();
    const regions = Object.keys(REGION_METADATA) as readonly RegionId[];

    for (const regionId of regions) {
      const meta = REGION_METADATA[regionId];
      const regionItems = FARCRY5_CATALOG.itemsByRegion.get(regionId) ?? [];
      let completedCount = 0;
      let rawRp = 0;

      for (const item of regionItems) {
        if (hasBit(bits, item.bitIndex)) {
          completedCount += 1;
          rawRp += item.rpReward;
        }
      }

      const cappedRp = createResistancePoints(Math.min(rawRp, meta.maxRp));
      const [t1, t2, t3] = meta.thresholds;
      const resistanceLevel: 0 | 1 | 2 | 3 =
        meta.maxRp === 0
          ? 0
          : cappedRp >= t3
            ? 3
            : cappedRp >= t2
              ? 2
              : cappedRp >= t1
                ? 1
                : 0;

      const totalCount = regionItems.length;
      const percentage = totalCount === 0 ? 100 : (completedCount / totalCount) * 100;

      map.set(regionId, {
        regionId,
        name: meta.name,
        herald: meta.herald,
        completedCount,
        totalCount,
        percentage,
        currentRp: cappedRp,
        maxRp: meta.maxRp,
        resistanceLevel,
      });
    }

    return map;
  });

  public readonly categoryProgress = computed<
    ReadonlyMap<ContentCategory, CategoryProgressSnapshot>
  >(() => {
    const bits = this.contentBitset();
    const map = new Map<ContentCategory, CategoryProgressSnapshot>();
    const categories = Object.keys(CATEGORY_QUOTAS) as readonly ContentCategory[];

    for (const category of categories) {
      const catItems = FARCRY5_CATALOG.itemsByCategory.get(category) ?? [];
      let completedCount = 0;
      for (const item of catItems) {
        if (hasBit(bits, item.bitIndex)) {
          completedCount += 1;
        }
      }
      const quota = CATEGORY_QUOTAS[category];
      map.set(category, {
        category,
        completedCount,
        quota,
        percentage: quota === 0 ? 100 : (completedCount / quota) * 100,
      });
    }

    return map;
  });

  public readonly steamScopeProgress = computed<
    ReadonlyMap<DlcScope, SteamScopeProgressSnapshot>
  >(() => {
    const bits = this.steamBitset();
    const map = new Map<DlcScope, SteamScopeProgressSnapshot>();
    const scopes = Object.keys(STEAM_SCOPE_QUOTAS) as readonly DlcScope[];

    for (const scope of scopes) {
      const achievements = FARCRY5_CATALOG.achievementsByScope.get(scope) ?? [];
      let unlockedCount = 0;
      for (const ach of achievements) {
        if (hasBit(bits, ach.bitIndex)) {
          unlockedCount += 1;
        }
      }
      const quota = STEAM_SCOPE_QUOTAS[scope];
      map.set(scope, {
        scope,
        unlockedCount,
        quota,
        percentage: quota === 0 ? 100 : (unlockedCount / quota) * 100,
      });
    }

    return map;
  });

  public readonly globalMetrics = computed<GlobalCompletionMetrics>(() => {
    const contentCompleted = countBits(this.contentBitset());
    const contentTotal = FARCRY5_CATALOG.items.length;
    const contentPercentage = (contentCompleted / contentTotal) * 100;

    const steamUnlocked = countBits(this.steamBitset());
    const steamTotal = FARCRY5_CATALOG.steamAchievements.length;
    const steamPercentage = (steamUnlocked / steamTotal) * 100;

    const true100Percentage = contentPercentage * 0.8 + steamPercentage * 0.2;

    return {
      contentCompleted,
      contentTotal,
      contentPercentage,
      steamUnlocked,
      steamTotal,
      steamPercentage,
      true100Percentage,
    };
  });

  public isItemCompleted(itemId: ItemId): boolean {
    const item = FARCRY5_CATALOG.itemById.get(itemId);
    if (item === undefined) {
      return false;
    }
    return hasBit(this.contentBitset(), item.bitIndex);
  }

  public isAchievementUnlocked(achievementId: SteamAchievementId): boolean {
    const ach = FARCRY5_CATALOG.achievementById.get(achievementId);
    if (ach === undefined) {
      return false;
    }
    return hasBit(this.steamBitset(), ach.bitIndex);
  }

  public toggleItem(itemId: ItemId): Result<boolean, TrackerError> {
    const item = FARCRY5_CATALOG.itemById.get(itemId);
    if (item === undefined) {
      const error: TrackerError = { code: 'ITEM_NOT_FOUND', itemId };
      this.lastErrorState.set(error);
      return err(error);
    }

    const currentBits = this.contentBitset();
    const currentlyCompleted = hasBit(currentBits, item.bitIndex);
    const nextState = !currentlyCompleted;

    if (nextState) {
      const missingPrereqs: ItemId[] = [];
      for (const prereqId of item.prerequisites) {
        const prereqItem = FARCRY5_CATALOG.itemById.get(prereqId);
        if (prereqItem === undefined || !hasBit(currentBits, prereqItem.bitIndex)) {
          missingPrereqs.push(prereqId);
        }
      }
      if (missingPrereqs.length > 0) {
        const error: TrackerError = {
          code: 'PREREQUISITE_NOT_MET',
          missingItemIds: missingPrereqs,
        };
        this.lastErrorState.set(error);
        return err(error);
      }

      if (item.requiredRp !== undefined) {
        const regSnap = this.regionProgress().get(item.region);
        const currentRp = regSnap?.currentRp ?? createResistancePoints(0);
        if (currentRp < item.requiredRp) {
          const error: TrackerError = {
            code: 'RP_THRESHOLD_NOT_MET',
            region: item.region,
            currentRp,
            requiredRp: item.requiredRp,
          };
          this.lastErrorState.set(error);
          return err(error);
        }
      }
    }

    const updatedContentBits = withBit(currentBits, item.bitIndex, nextState);
    this.contentBitset.set(updatedContentBits);
    this.reconcileLinkedSteamAchievements(updatedContentBits);
    this.lastErrorState.set(null);
    this.persistToStorage();
    return ok(nextState);
  }

  public toggleSteamAchievement(
    achievementId: SteamAchievementId
  ): Result<boolean, TrackerError> {
    const achievement = FARCRY5_CATALOG.achievementById.get(achievementId);
    if (achievement === undefined) {
      const error: TrackerError = { code: 'ACHIEVEMENT_NOT_FOUND', achievementId };
      this.lastErrorState.set(error);
      return err(error);
    }

    const currentSteamBits = this.steamBitset();
    const nextState = !hasBit(currentSteamBits, achievement.bitIndex);
    this.steamBitset.set(withBit(currentSteamBits, achievement.bitIndex, nextState));
    this.lastErrorState.set(null);
    this.persistToStorage();
    return ok(nextState);
  }

  public getItemsByFilter(
    region: RegionId | 'ALL',
    category: ContentCategory | 'ALL',
    status: CompletionFilterStatus = 'ALL',
    searchQuery = ''
  ): readonly ContentItem[] {
    let base: readonly ContentItem[];
    if (region === 'ALL') {
      base =
        category === 'ALL'
          ? FARCRY5_CATALOG.items
          : (FARCRY5_CATALOG.itemsByCategory.get(category) ?? []);
    } else if (category === 'ALL') {
      base = FARCRY5_CATALOG.itemsByRegion.get(region) ?? [];
    } else {
      const byRegion = FARCRY5_CATALOG.itemsByRegion.get(region) ?? [];
      base = byRegion.filter((item) => item.category === category);
    }

    const bits = this.contentBitset();
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (status === 'ALL' && normalizedQuery.length === 0) {
      return base;
    }

    return base.filter((item) => {
      const done = hasBit(bits, item.bitIndex);
      if (status === 'COMPLETED' && !done) {
        return false;
      }
      if (status === 'PENDING' && done) {
        return false;
      }
      if (normalizedQuery.length > 0) {
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.locationHint.toLowerCase().includes(normalizedQuery)
        );
      }
      return true;
    });
  }

  public getAchievementsByScope(
    scope: DlcScope | 'ALL',
    status: CompletionFilterStatus = 'ALL',
    searchQuery = ''
  ): readonly SteamAchievement[] {
    const base =
      scope === 'ALL'
        ? FARCRY5_CATALOG.steamAchievements
        : (FARCRY5_CATALOG.achievementsByScope.get(scope) ?? []);

    const bits = this.steamBitset();
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (status === 'ALL' && normalizedQuery.length === 0) {
      return base;
    }

    return base.filter((ach) => {
      const unlocked = hasBit(bits, ach.bitIndex);
      if (status === 'COMPLETED' && !unlocked) {
        return false;
      }
      if (status === 'PENDING' && unlocked) {
        return false;
      }
      if (normalizedQuery.length > 0) {
        return (
          ach.title.toLowerCase().includes(normalizedQuery) ||
          ach.description.toLowerCase().includes(normalizedQuery) ||
          ach.apiName.toLowerCase().includes(normalizedQuery)
        );
      }
      return true;
    });
  }

  private reconcileLinkedSteamAchievements(contentBits: Uint32Array): void {
    let nextSteamBits: Uint32Array = new Uint32Array(this.steamBitset());
    let mutated = false;

    for (const ach of FARCRY5_CATALOG.steamAchievements) {
      if (ach.linkedItemIds.length === 0 || ach.scope === 'ng_plus') {
        continue;
      }
      let allLinkedComplete = true;
      for (const itemId of ach.linkedItemIds) {
        const linkedItem = FARCRY5_CATALOG.itemById.get(itemId);
        if (linkedItem === undefined || !hasBit(contentBits, linkedItem.bitIndex)) {
          allLinkedComplete = false;
          break;
        }
      }
      if (allLinkedComplete && !hasBit(nextSteamBits, ach.bitIndex)) {
        nextSteamBits = withBit(nextSteamBits, ach.bitIndex, true);
        mutated = true;
      }
    }

    if (mutated) {
      this.steamBitset.set(nextSteamBits);
    }
  }

  public persistToStorage(): Result<void, TrackerError> {
    try {
      const payload: PersistedTrackerState = {
        version: 1,
        contentBitsetHex: bitsetToHex(this.contentBitset()),
        steamBitsetHex: bitsetToHex(this.steamBitset()),
        updatedAtEpochMs: Date.now(),
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
      return ok(undefined);
    } catch (error: unknown) {
      const trackerError: TrackerError = {
        code: 'STORAGE_CORRUPTED',
        reason: error instanceof Error ? error.message : 'Fallo de escritura en localStorage.',
      };
      this.lastErrorState.set(trackerError);
      return err(trackerError);
    }
  }

  public hydrateFromStorage(): Result<boolean, TrackerError> {
    try {
      if (typeof localStorage === 'undefined') {
        return ok(false);
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return ok(false);
      }
      const parsed: unknown = JSON.parse(raw);
      if (!isPersistedState(parsed)) {
        const error: TrackerError = {
          code: 'STORAGE_CORRUPTED',
          reason: 'El esquema almacenado no cumple PersistedTrackerState v1.',
        };
        this.lastErrorState.set(error);
        return err(error);
      }

      const contentDecoded = hexToBitset(parsed.contentBitsetHex, CONTENT_WORD_COUNT);
      if (!contentDecoded.ok) {
        this.lastErrorState.set(contentDecoded.error);
        return contentDecoded;
      }

      const steamDecoded = hexToBitset(parsed.steamBitsetHex, STEAM_WORD_COUNT);
      if (!steamDecoded.ok) {
        this.lastErrorState.set(steamDecoded.error);
        return steamDecoded;
      }

      this.contentBitset.set(contentDecoded.value);
      this.steamBitset.set(steamDecoded.value);
      this.lastErrorState.set(null);
      return ok(true);
    } catch (error: unknown) {
      const trackerError: TrackerError = {
        code: 'STORAGE_CORRUPTED',
        reason: error instanceof Error ? error.message : 'JSON corrupto en almacenamiento.',
      };
      this.lastErrorState.set(trackerError);
      return err(trackerError);
    }
  }

  public async syncFromSteamWebApi(
    steamApiKey: string,
    steamId64: string,
    timeoutMs = 8000
  ): Promise<Result<number, TrackerError>> {
    const cleanKey = steamApiKey.trim();
    const cleanSteamId = steamId64.trim();
    if (cleanKey.length === 0 || !/^\d{17}$/.test(cleanSteamId)) {
      const error: TrackerError = {
        code: 'STEAM_SYNC_FAILED',
        reason: 'API Key vacía o SteamID64 inválido (debe contener 17 dígitos).',
      };
      this.lastErrorState.set(error);
      return err(error);
    }

    const controller = new AbortController();
    const timerId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const endpoint = new URL(
        'https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/'
      );
      endpoint.searchParams.set('appid', String(STEAM_APP_ID));
      endpoint.searchParams.set('key', cleanKey);
      endpoint.searchParams.set('steamid', cleanSteamId);

      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const error: TrackerError = {
          code: 'STEAM_SYNC_FAILED',
          reason: `HTTP ${String(response.status)} al consultar Steam Web API.`,
        };
        this.lastErrorState.set(error);
        return err(error);
      }

      const payload: unknown = await response.json();
      if (!isSteamAchievementResponse(payload) || !payload.playerstats.success) {
        const error: TrackerError = {
          code: 'STEAM_SYNC_FAILED',
          reason: 'Respuesta de Steam inválida o perfil privado.',
        };
        this.lastErrorState.set(error);
        return err(error);
      }

      let nextSteamBits: Uint32Array = new Uint32Array(this.steamBitset());
      let syncedCount = 0;

      for (const entry of payload.playerstats.achievements) {
        if (entry.achieved === 1) {
          const catalogAch = FARCRY5_CATALOG.achievementByApiName.get(entry.apiname);
          if (catalogAch !== undefined) {
            nextSteamBits = withBit(nextSteamBits, catalogAch.bitIndex, true);
            syncedCount += 1;
          }
        }
      }

      this.steamBitset.set(nextSteamBits);
      this.lastErrorState.set(null);
      this.persistToStorage();
      return ok(syncedCount);
    } catch (error: unknown) {
      const trackerError: TrackerError = {
        code: 'STEAM_SYNC_FAILED',
        reason:
          error instanceof Error ? error.message : 'Fallo de red o timeout con Steam Web API.',
      };
      this.lastErrorState.set(trackerError);
      return err(trackerError);
    } finally {
      clearTimeout(timerId);
    }
  }
}
