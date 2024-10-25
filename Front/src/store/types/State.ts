export type StateAsMap<T> = Record<string, T>

export type StateAsMapByYears<T> = Record<string, Record<string, T>>

export type StateAsMapByYearsDeep = Record<
    string,
    Record<string, Record<string, Record<string, unknown>>>
>

/** State as a one dimensional state map. Items are accessible with a single key (item identifier). */
export type StateMap<T> = Record<string, T>
/** State as a two dimensional state map. Items are accessible with two keys (i.e. year identifier & item identifier) */
export type StateMap2D<T> = StateMap<StateMap<T>>
/** State as a three dimensional state map. Items are accessible with three keys (i.e. year identifier & entity identifier & item identifier) */
export type StateMap3D<T> = StateMap<StateMap<StateMap<T>>>
