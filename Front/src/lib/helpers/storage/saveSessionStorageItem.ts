/**
 * Tries to save an item of type T to session storage, if parsing or storing fails returns false.
 * @param key The key in sessionStorage.
 * @param data The data need to be serialized and saved to sessionStorage.
 */
export function saveSessionStorageItem<T>(key: string, data: T): boolean {
    try {
        sessionStorage.setItem(key, JSON.stringify(data))
        return true
    } catch {
        console.error(`Cannot set ${key} to SessionStorage`)
    }

    return false
}
