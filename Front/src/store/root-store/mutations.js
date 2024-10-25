import { ConfigurableColumnNamespace, StorageKey } from 'misc/constants'
import { getLocalStorageItem } from 'lib/helpers'

export const LOAD_USER_SETTINGS = state => {
    // Get possible columns user preference state from storage
    const preference = getLocalStorageItem(StorageKey.Columns)

    if (preference && typeof preference === 'object') {
        for (const namespace in ConfigurableColumnNamespace) {
            if (namespace in preference) {
                state.columns.userPreference[namespace] = preference[namespace]
            }
        }
    }

    // Get possible menu stickiness from storage
    const menuIsSticky = getLocalStorageItem(StorageKey.MenuSticky)
    if (typeof menuIsSticky === 'boolean') {
        state.app.menuIsSticky = menuIsSticky
    }
}
