import * as localization from './localization'
import { StorageKey, SupportedLocales } from 'misc/constants'

/** Cache info about which locales are already loaded. */
const loadedLocales: string[] = []

export async function loadFallbackLocale(): Promise<void> {
    const enLocale = SupportedLocales.find(lang => lang.Name === 'English')
    if (!enLocale) {
        return
    }

    const solutionMessages = await import('../locales/en.json')

    i18n.global.setLocaleMessage(enLocale.Code, solutionMessages.default)
    loadedLocales.push(enLocale.Code)
    return
}

/**
 * Change locale to i18n and asynchronously load translations.
 *
 * If fuzzyMessages is defined, then that is used for translations
 * instead of using version controlled translations.
 * @param locale Alpha-2 language code
 * @param fuzzyMessages=null. i18n messages in key_value_json format.
 */
export async function loadLocale(locale: string): Promise<void> {
    // Just set locale if it's already loaded
    if (loadedLocales.includes(locale)) {
        i18n.global.locale.value = locale
        return
    }

    const solutionMessages = await import('../locales/en.json')

    i18n.global.setLocaleMessage(locale, solutionMessages.default)

    loadedLocales.push(locale)
    i18n.global.locale.value = locale
    return
}

const i18n = localization.i18n

loadFallbackLocale().then(async () => {
    const initialLocale = localization.getInitialLocale(StorageKey.Locale, SupportedLocales)
    await loadLocale(initialLocale)
    localization.setLocaleToStorage(StorageKey.Locale, initialLocale)
})

export default i18n
