import { getLocalStorageItem, getSessionStorageItem } from 'lib/helpers'

/**
 * Get item from session storage, if the session storage value is null, get it from local storage.
 * @param key The key in Session and/or Local Storage.
 */
export function getStorageItem<T>(key: string): T | null {
    return getSessionStorageItem<T>(key) ?? getLocalStorageItem<T>(key)
}
