import { saveLocalStorageItem, saveSessionStorageItem } from 'lib/helpers'

/**
 * Tries to save an item of type T to both, local storage and session storage and returns false if saving fails
 * @param key Key in both storages
 * @param item Item to be saved
 */
export function saveStorageItem<T>(key: string, item: T): boolean {
    try {
        if (saveSessionStorageItem(key, item) && saveLocalStorageItem(key, item)) {
            return true
        }
    } catch {
        console.error(`Cannot set ${key} to storage`)
    }

    return false
}
