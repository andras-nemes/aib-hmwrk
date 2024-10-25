/**
 * Tries to get an item of type T from local storage, if not found or parsing fails returns undefined.
 * @param key The key in localStorage.
 */
export function getLocalStorageItem<T>(key: string): T | null {
    try {
        const storageItem = localStorage.getItem(key)
        if (storageItem !== null) {
            return JSON.parse(storageItem)
        }
    } catch {
        console.error(`Cannot get ${key} from LocalStorage`)
    }

    return null
}
