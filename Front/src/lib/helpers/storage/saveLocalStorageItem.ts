/**
 * Tries to save an item of type T to local storage, if parsing or storing fails returns false.
 * @param key The key in localStorage.
 * @param data The data need to be serialized and saved to localStorage.
 */
export function saveLocalStorageItem<T>(key: string, data: T): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(data))
        return true
    } catch {
        console.error(`Cannot set ${key} to LocalStorage`)
    }

    return false
}
