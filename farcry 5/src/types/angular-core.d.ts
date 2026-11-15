export interface Signal<T> {
  (): T;
}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(updateFn: (value: T) => T): void;
  asReadonly(): Signal<T>;
}

export function signal<T>(initialValue: T): WritableSignal<T>;
export function computed<T>(computation: () => T): Signal<T>;

export interface InjectableOptions {
  readonly providedIn?: 'root' | 'platform' | null;
}

export function Injectable(options?: InjectableOptions): ClassDecorator;

export type ProviderToken<T> = abstract new (...args: never[]) => T;

export function inject<T>(token: ProviderToken<T>): T;

export enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1,
}

export interface ComponentOptions {
  readonly selector?: string;
  readonly standalone?: boolean;
  readonly changeDetection?: ChangeDetectionStrategy;
  readonly template?: string;
  readonly styles?: readonly string[];
}

export function Component(options: ComponentOptions): ClassDecorator;

export interface OnInit {
  ngOnInit(): void;
}
