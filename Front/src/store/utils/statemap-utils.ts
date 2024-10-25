import { coerceKey } from 'lib/helpers'
import equals from 'fast-deep-equal/es6'
import { clone } from 'ramda'

import type { StateMap, StateMap2D, StateMap3D } from 'store/types/State'

/** Base key configuration for all state map (StateAsMap, StateAsMap2D, StateAsMap3D) properties */
interface KeyConfigBase {
    /** Function to create a value which is set to the itemKey property. Function gets the item and array index as parameters.. Default value: null */
    createIdFn?: (item: Record<string, unknown>) => string
}

/** Key configuration for one dimensional StateMap properties */
export interface KeyConfig extends KeyConfigBase {
    /** State items' key property */
    keyProp: string
}

/** Key configuration for two dimensional StateMap2D properties */
export interface KeyConfig2D extends KeyConfigBase {
    /** State items' key properties */
    keyProp: [string, string]
}

/** Key configuration for three dimensional StateMap3D properties */
export interface KeyConfig3D extends KeyConfigBase {
    /** State items' key properties */
    keyProp: [string, string, string]
}

/**
 * Clear state from the given path (i.e. sets empty object).
 * If keyPath is empty or NULL then whole state will be emptied.
 * @param state Module state's property
 * @param keyPath Path to the property that is going to be cleared
 */
function clearStatePath<S>(
    state: StateMap<S> | StateMap2D<S> | StateMap3D<S>,
    keyPath: string[] | null
): StateMap<S> | StateMap2D<S> | StateMap3D<S> {
    // If path is missing then just clear the whole state.
    if (!keyPath || !keyPath.length) {
        return {}
    }

    return setStatePath(state, keyPath, {} as Record<string, unknown>, false)
}

/**
 * Updates value in a given path of the state.
 * @param state Module state's property
 * @param keyPath Array of keys defining the path
 * @param value Value to upsert to the state object
 * @param addMissing Fill gaps in the path with empty objects.
 */
function setStatePath<S>(
    state: StateMap<S> | StateMap2D<S> | StateMap3D<S>,
    keyPath: string[],
    value: S | Record<string, unknown>,
    addMissing = true
): StateMap<S> | StateMap2D<S> | StateMap3D<S> {
    let obj = state as Record<string, unknown>
    for (const [idx, key] of keyPath.entries()) {
        if (addMissing) {
            // Create possible nested objects
            if (!obj[key] && idx + 1 < keyPath.length) {
                obj[key] = {}
            }
        }

        // If the end of path cannot be reached then just return the current state.
        if (!addMissing && (!obj || !obj[key])) {
            return state
        }

        // If reached the end of path, set the value
        if (idx + 1 === keyPath.length) {
            obj[key] = value
        }

        // Move to the next part of the path.
        obj = obj[key] as Record<string, unknown>
    }

    return state
}

/**
 * Delete an item from the given path of the state.
 * @param state Module state's property
 * @param keyPath Array of keys defining the path
 */
function deleteStatePath<S>(
    state: StateMap<S> | StateMap2D<S> | StateMap3D<S>,
    keyPath: string[]
): StateMap<S> | StateMap2D<S> | StateMap3D<S> {
    let obj = state as Record<string, unknown>
    for (const [idx, key] of keyPath.entries()) {
        // If the end of path cannot be reached then just return the current state.
        if (!obj || !obj[key]) {
            return state
        }

        // If reached the end of path, delete the value
        if (idx + 1 === keyPath.length) {
            delete obj[key]
            break
        }

        // Move to the next part of the path.
        obj = obj[key] as Record<string, unknown>
    }

    return state
}

/**
 * Returns array of key values for the given item.
 * @param item State item (has values for the key properties)
 * @param keyProp Array of key properties used in the state
 */
function getKeyPath(item: Record<string, unknown>, keyProp: string[] | string): string[] {
    if (typeof keyProp === 'string') {
        return [item[keyProp] as string]
    }

    return keyProp.map(key => item[key] as string)
}

/**
 * Replace StateMap3D values with the given data.
 * Supplying keyValues will allow the state replacement to be done partially.
 * @param state Module state's property
 * @param data Array of data used to replace the current state
 * @param keyConfig Module's key configuration
 * @param keyValues Array of key values for partially replacing the state.
 */
function replaceStateMap3D<S>(
    state: StateMap3D<S> | null,
    data: S[] | null,
    keyConfig: KeyConfig3D,
    keyValues: string[] | null = null
): StateMap3D<S> {
    // Transform null state into empty state
    if (!state) {
        state = {}
    }

    // Clear state if keyValues are given.
    // Values are used to set value to empty object in certain place of the state.
    const clearedState = clearStatePath(clone(state), keyValues) as StateMap3D<S>

    if (data) {
        const updated = upsertToStateMap3D<S>(clearedState, data, keyConfig)
        // Check if state actually changed,
        // if there's no actual change return original state
        // to avoid any unnecessary re-evaluation of getters/computed.
        return equals(state, updated) ? state : updated
    }

    return clearedState
}

/**
 * Replace StateMap2D values with the given data.
 * Supplying keyValues will allow the state replacement to be done partially.
 * @param state Module state's property
 * @param data Array of data used to replace the current state
 * @param keyConfig Module's key configuration
 * @param keyValues Array of key values for partially replacing the state.
 */
function replaceStateMap2D<S>(
    state: StateMap2D<S> | null,
    data: S[] | null,
    keyConfig: KeyConfig2D,
    keyValues: string[] | null = null
): StateMap2D<S> {
    // Transform null state into empty state
    if (!state) {
        state = {}
    }

    // Clear state if keyValues are given.
    // Values are used to set value to empty object in certain place of the state.
    const clearedState = clearStatePath(clone(state), keyValues) as StateMap2D<S>

    if (data) {
        const updated = upsertToStateMap2D<S>(clearedState, data, keyConfig)
        // Check if state actually changed,
        // if there's no actual change return original state
        // to avoid any unnecessary re-evaluation of getters/computed.
        return equals(state, updated) ? state : updated
    }

    return clearedState
}

/**
 * Replace StateMap values with the given data.
 * @param data Array of data used to replace the current state
 * @param keyConfig Module's key configuration
 */
function replaceStateMap<S>(data: S[] | null, keyConfig: KeyConfig): StateMap<S> {
    if (data) {
        return upsertToStateMap<S>({}, data, keyConfig)
    }

    return {}
}

/**
 * Update/insert values to the StateMap3D.
 * @param state Module state's property
 * @param data Data to upsert to the state
 * @param keyConfig Module's key configuration
 */
function upsertToStateMap3D<S>(
    state: StateMap3D<S> | null,
    data: S | S[],
    keyConfig: KeyConfig3D
): StateMap3D<S> {
    // Transform null state into empty state
    if (!state) {
        state = {}
    }

    // Make sure data handled is an array
    const items = Array.isArray(data) ? data : [data]
    const cloneState = clone(state)
    const createIdFn = keyConfig.createIdFn

    for (const item of items) {
        const unsafeItem = item as Record<string, unknown>

        // If createIdFn is defined let's dynamically assign
        // a generated identifier for the item.
        if (createIdFn) {
            unsafeItem[keyConfig.keyProp[2]] = createIdFn(unsafeItem)
        }

        const keyPath = getKeyPath(unsafeItem, keyConfig.keyProp)
        setStatePath<S>(cloneState, keyPath, unsafeItem) as StateMap3D<S>
    }

    return cloneState
}

/**
 * Update/insert values to the StateMap2D.
 * @param state Module state's property
 * @param data Data to upsert to the state
 * @param keyConfig Module's key configuration
 */
function upsertToStateMap2D<S>(
    state: StateMap2D<S> | null,
    data: S | S[],
    keyConfig: KeyConfig2D
): StateMap2D<S> {
    // Transform null state into empty state
    if (!state) {
        state = {}
    }

    // Make sure data handled is an array
    const items = Array.isArray(data) ? data : [data]
    const cloneState = clone(state)
    const createIdFn = keyConfig.createIdFn

    for (const item of items) {
        const unsafeItem = item as Record<string, unknown>

        // If createIdFn is defined let's dynamically assign
        // a generated identifier for the item.
        if (createIdFn) {
            unsafeItem[keyConfig.keyProp[1]] = createIdFn(unsafeItem)
        }

        const keyPath = getKeyPath(unsafeItem, keyConfig.keyProp)
        setStatePath<S>(cloneState, keyPath, unsafeItem) as StateMap2D<S>
    }

    return cloneState
}

/**
 * Update/insert values to the StateMap.
 * @param state Module state's property
 * @param data Data to upsert to the state
 * @param keyConfig Module's key configuration
 */
function upsertToStateMap<S>(
    state: StateMap<S> | null,
    data: S | S[],
    keyConfig: KeyConfig
): StateMap<S> {
    // Transform null state into empty state
    if (!state) {
        state = {}
    }

    // Make sure data handled is an array
    const items = Array.isArray(data) ? data : [data]
    const cloneState = clone(state)
    const createIdFn = keyConfig.createIdFn

    for (const item of items) {
        const unsafeItem = item as Record<string, unknown>

        // If createIdFn is defined let's dynamically assign
        // a generated identifier for the item.
        if (createIdFn) {
            unsafeItem[keyConfig.keyProp] = createIdFn(unsafeItem)
        }

        const keyPath = getKeyPath(unsafeItem, keyConfig.keyProp)
        setStatePath<S>(cloneState, keyPath, unsafeItem) as StateMap<S>
    }

    return cloneState
}

/**
 * Delete value(s) from the StateMap3D
 * @param  state Module state's property
 * @param  data Data to be deleted from the state
 * @param  keyConfig Module's key configuration
 */
function removeFromStateMap3D<S>(
    state: StateMap3D<S> | null,
    data: S | S[],
    keyConfig: KeyConfig3D
): StateMap3D<S> | null {
    // If state is empty, don't do anything
    if (!state) {
        return state
    }

    // Make sure data handled is an array
    const items = Array.isArray(data) ? data : [data]
    const cloneState = clone(state)

    for (const item of items) {
        const unsafeItem = item as Record<string, unknown>

        const keyPath = getKeyPath(unsafeItem, keyConfig.keyProp)
        deleteStatePath<S>(cloneState, keyPath) as StateMap3D<S>
    }

    return cloneState
}

/**
 * Delete value(s) from the StateMap2D
 * @param  state Module state's property
 * @param  data Data to be deleted from the state
 * @param  keyConfig Module's key configuration
 */
function removeFromStateMap2D<S>(
    state: StateMap2D<S> | null,
    data: S | S[],
    keyConfig: KeyConfig2D
): StateMap2D<S> | null {
    // If state is empty, don't do anything
    if (!state) {
        return state
    }

    // Make sure data handled is an array
    const items = Array.isArray(data) ? data : [data]
    const cloneState = clone(state)
    const createIdFn = keyConfig.createIdFn

    for (const item of items) {
        const unsafeItem = item as Record<string, unknown>

        // If createIdFn is defined let's dynamically assign
        // a generated identifier for the item.
        if (createIdFn) {
            unsafeItem[keyConfig.keyProp[1]] = createIdFn(unsafeItem)
        }

        const keyPath = getKeyPath(unsafeItem, keyConfig.keyProp)
        deleteStatePath<S>(cloneState, keyPath) as StateMap2D<S>
    }

    return cloneState
}

/**
 * Delete value(s) from the StateMap
 * @param state Module state's property
 * @param data Data to be deleted from the state
 * @param keyConfig Module's key configuration
 */
function removeFromStateMap<S>(
    state: StateMap<S> | null,
    data: S | S[],
    keyConfig: KeyConfig
): StateMap<S> | null {
    // If state is empty, don't do anything
    if (!state) {
        return state
    }

    // Make sure data handled is an array
    const items = Array.isArray(data) ? data : [data]
    const cloneState = clone(state)

    for (const item of items) {
        const unsafeItem = item as Record<string, unknown>

        const keyPath = getKeyPath(unsafeItem, keyConfig.keyProp)
        deleteStatePath<S>(cloneState, keyPath) as StateMap<S>
    }

    return cloneState
}

/**
 * Converts StateMap object to an array.
 * @param state Module's state property
 * @param getters Vuex global getters
 * @param mapFn Transformation function that calls some additional getters on found object
 * @param preMapCheckFn First check function. Lambda like `(item) => item.prop === 'foo'`
 * @param postMapCheckFn Second check function for trying after mapping. Lambda like `(item) => item.prop === 'foo'`
 */
function convertStateMapToArray<S, T = S>(
    state: StateMap<S>,
    getters: unknown = null,
    mapFn: ((item: S, getters: unknown) => T) | null = null,
    preMapCheckFn: ((item: S) => boolean) | null = null,
    postMapCheckFn: ((item: T) => boolean) | null = null
): Array<T> {
    const stateArray = []
    for (const key of Object.keys(state)) {
        const stateItem = state[key]
        // We only want to get items that pass the first check function if it's there
        if (!preMapCheckFn || preMapCheckFn(stateItem)) {
            // Apply map function if it's there
            const mappedItem = mapFn ? mapFn(stateItem, getters) : (stateItem as unknown as T)
            // We only want to get items that pass the second check function if it's there
            if (!postMapCheckFn || postMapCheckFn(mappedItem)) {
                stateArray.push(mappedItem)
            }
        }
    }

    return stateArray
}

/**
 * Get part of the StateMap3D object as an array.
 * @param state Module's state property
 * @param keyValues Key path to the part of the state that is converted into an array.
 * @param getters Vuex global getters
 * @param mapFn Transformation function that calls some additional getters on found object
 * @param preMapCheckFn First check function. Lambda like `(item) => item.prop === 'foo'`
 * @param postMapCheckFn Second check function for trying after mapping. Lambda like `(item) => item.prop === 'foo'`
 */
function getStateMap3DAsArray<S, T = S>(
    state: StateMap3D<S> | null,
    keyValues: [string | number, string | number],
    getters: unknown = null,
    mapFn: ((item: S, getters: unknown) => T) | null = null,
    preMapCheckFn: ((item: S) => boolean) | null = null,
    postMapCheckFn: ((item: T) => boolean) | null = null
): Array<T> {
    const keyValueOne = coerceKey(keyValues[0]) || ''
    const keyValueTwo = coerceKey(keyValues[1]) || ''

    const partialState = state?.[keyValueOne]?.[keyValueTwo]
    if (partialState) {
        return convertStateMapToArray(partialState, getters, mapFn, preMapCheckFn, postMapCheckFn)
    }

    return []
}

/**
 * Get part of the StateMap2D object as an array.
 * @param state Module's state property
 * @param keyValue Key path to the part of the state that is converted into an array.
 * @param getters Vuex global getters
 * @param mapFn Transformation function that calls some additional getters on found object
 * @param preMapCheckFn First check function. Lambda like `(item) => item.prop === 'foo'`
 * @param postMapCheckFn Second check function for trying after mapping. Lambda like `(item) => item.prop === 'foo'`
 */
function getStateMap2DAsArray<S, T = S>(
    state: StateMap2D<S> | null,
    keyValue: string | number,
    getters: unknown = null,
    mapFn: ((item: S, getters: unknown) => T) | null = null,
    preMapCheckFn: ((item: S) => boolean) | null = null,
    postMapCheckFn: ((item: T) => boolean) | null = null
): Array<T> {
    const keyValueOne = coerceKey(keyValue) || ''

    const partialState = state?.[keyValueOne]
    if (partialState) {
        return convertStateMapToArray(partialState, getters, mapFn, preMapCheckFn, postMapCheckFn)
    }

    return []
}

/**
 * Get StateMap object as an array.
 * @param state Module's state property
 * @param getters Vuex global getters
 * @param mapFn Transformation function that calls some additional getters on found object
 * @param preMapCheckFn First check function. Lambda like `(item) => item.prop === 'foo'`
 * @param postMapCheckFn Second check function for trying after mapping. Lambda like `(item) => item.prop === 'foo'`
 */
function getStateMapAsArray<S, T = S>(
    state: StateMap<S> | null,
    getters: unknown = null,
    mapFn: ((item: S, getters: unknown) => T) | null = null,
    preMapCheckFn: ((item: S) => boolean) | null = null,
    postMapCheckFn: ((item: T) => boolean) | null = null
): Array<T> {
    if (state) {
        return convertStateMapToArray(state, getters, mapFn, preMapCheckFn, postMapCheckFn)
    }

    return []
}

/**
 * Get a single item from the StateMap3D using item's THREE keys to access it.
 * @param state Module's state property
 * @param keyValues Key path to the item.
 * @param getters Vuex global getters
 * @param mapFn Transformation function that calls some additional getters on found object
 */
function getItemFromStateMap3D<S, T = S>(
    state: StateMap3D<S> | null,
    keyValues: [string | number, string | number, string | number],
    getters: unknown = null,
    mapFn: ((item: S, getters: unknown) => T) | null = null
): T | null {
    const keyValueOne = coerceKey(keyValues[0]) || ''
    const keyValueTwo = coerceKey(keyValues[1]) || ''
    const keyValueThree = coerceKey(keyValues[2]) || ''

    const item = state?.[keyValueOne]?.[keyValueTwo]?.[keyValueThree]
    if (item) {
        return mapFn ? mapFn(item, getters) : (item as unknown as T)
    }

    return null
}

/**
 * Get a single item from the StateMap2D using item's TWO keys to access it.
 * @param state Module's state property
 * @param keyValues Key path to the item.
 * @param getters Vuex global getters
 * @param mapFn Transformation function that calls some additional getters on found object
 */
function getItemFromStateMap2D<S, T = S>(
    state: StateMap2D<S> | null,
    keyValues: [string | number, string | number],
    getters: unknown = null,
    mapFn: ((item: S, getters: unknown) => T) | null = null
): T | null {
    const keyValueOne = coerceKey(keyValues[0]) || ''
    const keyValueTwo = coerceKey(keyValues[1]) || ''

    const item = state?.[keyValueOne]?.[keyValueTwo]
    if (item) {
        return mapFn ? mapFn(item, getters) : (item as unknown as T)
    }

    return null
}

/**
 * Get a single item from the StateMap using item's KEY to access it.
 * @param state Module's state property
 * @param keyValue Item's key value
 * @param getters Vuex global getters
 * @param mapFn Transformation function that calls some additional getters on found object
 */
function getItemFromStateMap<S, T = S>(
    state: StateMap<S> | null,
    keyValue: string | number,
    getters: unknown = null,
    mapFn: ((item: S, getters: unknown) => T) | null = null
): T | null {
    const keyValueOne = coerceKey(keyValue) || ''

    const item = state?.[keyValueOne]
    if (item) {
        return mapFn ? mapFn(item, getters) : (item as unknown as T)
    }

    return null
}

/** Utility collection for handling a one dimensional state map (StateAsMap) */
export const StateMapUtil = {
    remove: removeFromStateMap,
    getAsArray: getStateMapAsArray,
    getItem: getItemFromStateMap,
    replace: replaceStateMap,
    upsert: upsertToStateMap,
}

/** Utility collection for handling a two dimensional state map (StateAsMap2D) */
export const StateMapUtil2D = {
    remove: removeFromStateMap2D,
    getAsArray: getStateMap2DAsArray,
    getItem: getItemFromStateMap2D,
    replace: replaceStateMap2D,
    upsert: upsertToStateMap2D,
}

/** Utility collection for handling a three dimensional state map (StateAsMap3D) */
export const StateMapUtil3D = {
    remove: removeFromStateMap3D,
    getAsArray: getStateMap3DAsArray,
    getItem: getItemFromStateMap3D,
    replace: replaceStateMap3D,
    upsert: upsertToStateMap3D,
}
