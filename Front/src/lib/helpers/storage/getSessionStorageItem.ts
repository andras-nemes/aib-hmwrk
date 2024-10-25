/**
 * Tries to get an item of type T from session storage, if not found or parsing fails returns undefined.
 * @param key The key in sessionStorage.
 */
export function getSessionStorageItem<T>(key: string): T | null {
    try {
        const storageItem = sessionStorage.getItem(key)
        if (storageItem !== null) {
            return JSON.parse(storageItem)
        }
    } catch {
        console.error(`Cannot get ${key} from SessionStorage`)
    }

    return null
}
