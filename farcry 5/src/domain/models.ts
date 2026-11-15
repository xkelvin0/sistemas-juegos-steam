declare const __brand: unique symbol;

export type Brand<K, T extends string> = K & { readonly [__brand]: T };

export type ItemId = Brand<string, 'ItemId'>;
export type SteamAchievementId = Brand<string, 'SteamAchievementId'>;
export type ResistancePoints = Brand<number, 'ResistancePoints'>;
export type BitIndex = Brand<number, 'BitIndex'>;

export type RegionId =
  | 'dutch_island'
  | 'holland_valley'
  | 'henbane_river'
  | 'whitetail_mountains'
  | 'compound'
  | 'dlc_vietnam'
  | 'dlc_mars'
  | 'dlc_zombies';

export type ContentCategory =
  | 'STORY_MISSION'
  | 'SIDE_MISSION'
  | 'PREPPER_STASH'
  | 'CULT_OUTPOST'
  | 'CULT_PROPERTY'
  | 'CLUTCH_NIXON'
  | 'COLLECTIBLE'
  | 'SPECIALIST'
  | 'FISHING_RECORD'
  | 'PERK'
  | 'CHALLENGE'
  | 'DLC_OBJECTIVE';

export type CollectibleSubType =
  | 'BASEBALL_CARD'
  | 'BOBBLEHEAD'
  | 'COMIC_BOOK'
  | 'VIETNAM_LIGHTER'
  | 'VINYL_CRATE'
  | 'WHISKEY_CASK';

export type DlcScope =
  | 'base'
  | 'ng_plus'
  | 'hours_of_darkness'
  | 'lost_on_mars'
  | 'dead_living_zombies';

export type CompletionFilterStatus = 'ALL' | 'PENDING' | 'COMPLETED';

export interface RegionMetadata {
  readonly id: RegionId;
  readonly name: string;
  readonly herald: string;
  readonly maxRp: ResistancePoints;
  readonly thresholds: readonly [ResistancePoints, ResistancePoints, ResistancePoints];
}

export interface ContentItem {
  readonly id: ItemId;
  readonly bitIndex: BitIndex;
  readonly title: string;
  readonly region: RegionId;
  readonly category: ContentCategory;
  readonly locationHint: string;
  readonly rpReward: ResistancePoints;
  readonly requiredRp?: ResistancePoints;
  readonly prerequisites: readonly ItemId[];
  readonly collectibleType?: CollectibleSubType;
  readonly missableWarning?: string;
}

export interface SteamAchievement {
  readonly id: SteamAchievementId;
  readonly bitIndex: BitIndex;
  readonly apiName: string;
  readonly title: string;
  readonly description: string;
  readonly scope: DlcScope;
  readonly linkedItemIds: readonly ItemId[];
}

export interface PersistedTrackerState {
  readonly version: 1;
  readonly contentBitsetHex: string;
  readonly steamBitsetHex: string;
  readonly updatedAtEpochMs: number;
}

export interface SteamApiAchievementEntry {
  readonly apiname: string;
  readonly achieved: 0 | 1;
  readonly unlocktime: number;
}

export interface SteamPlayerStatsResponse {
  readonly playerstats: {
    readonly steamID: string;
    readonly gameName: string;
    readonly achievements: readonly SteamApiAchievementEntry[];
    readonly success: boolean;
  };
}

export type TrackerError =
  | { readonly code: 'ITEM_NOT_FOUND'; readonly itemId: string }
  | { readonly code: 'ACHIEVEMENT_NOT_FOUND'; readonly achievementId: string }
  | { readonly code: 'PREREQUISITE_NOT_MET'; readonly missingItemIds: readonly ItemId[] }
  | {
      readonly code: 'RP_THRESHOLD_NOT_MET';
      readonly region: RegionId;
      readonly currentRp: ResistancePoints;
      readonly requiredRp: ResistancePoints;
    }
  | { readonly code: 'STORAGE_CORRUPTED'; readonly reason: string }
  | { readonly code: 'STEAM_SYNC_FAILED'; readonly reason: string };

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T, E = never>(value: T): Result<T, E> => ({
  ok: true,
  value,
});

export const err = <E, T = never>(error: E): Result<T, E> => ({
  ok: false,
  error,
});

export const createItemId = (raw: string): ItemId => {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    throw new RangeError('ItemId cannot be empty');
  }
  return normalized as ItemId;
};

export const createSteamAchievementId = (raw: string): SteamAchievementId => {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    throw new RangeError('SteamAchievementId cannot be empty');
  }
  return normalized as SteamAchievementId;
};

export const createResistancePoints = (value: number): ResistancePoints => {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new RangeError(`ResistancePoints must be a non-negative integer: ${String(value)}`);
  }
  return value as ResistancePoints;
};

export const createBitIndex = (index: number): BitIndex => {
  if (!Number.isInteger(index) || index < 0) {
    throw new RangeError(`BitIndex must be a non-negative integer: ${String(index)}`);
  }
  return index as BitIndex;
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidHexString = (value: unknown): value is string =>
  typeof value === 'string' && value.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(value);

export const isPersistedState = (value: unknown): value is PersistedTrackerState => {
  if (!isPlainRecord(value)) {
    return false;
  }
  return (
    value['version'] === 1 &&
    isValidHexString(value['contentBitsetHex']) &&
    isValidHexString(value['steamBitsetHex']) &&
    typeof value['updatedAtEpochMs'] === 'number' &&
    Number.isFinite(value['updatedAtEpochMs']) &&
    value['updatedAtEpochMs'] >= 0
  );
};

const isSteamApiAchievementEntry = (value: unknown): value is SteamApiAchievementEntry => {
  if (!isPlainRecord(value)) {
    return false;
  }
  const apiname = value['apiname'];
  const achieved = value['achieved'];
  const unlocktime = value['unlocktime'];
  return (
    typeof apiname === 'string' &&
    apiname.length > 0 &&
    (achieved === 0 || achieved === 1) &&
    typeof unlocktime === 'number' &&
    Number.isFinite(unlocktime) &&
    unlocktime >= 0
  );
};

export const isSteamAchievementResponse = (
  value: unknown
): value is SteamPlayerStatsResponse => {
  if (!isPlainRecord(value)) {
    return false;
  }
  const playerstats = value['playerstats'];
  if (!isPlainRecord(playerstats)) {
    return false;
  }
  const steamID = playerstats['steamID'];
  const gameName = playerstats['gameName'];
  const success = playerstats['success'];
  const achievements = playerstats['achievements'];

  if (
    typeof steamID !== 'string' ||
    typeof gameName !== 'string' ||
    typeof success !== 'boolean' ||
    !Array.isArray(achievements)
  ) {
    return false;
  }

  for (let i = 0; i < achievements.length; i += 1) {
    if (!isSteamApiAchievementEntry(achievements[i])) {
      return false;
    }
  }
  return true;
};
