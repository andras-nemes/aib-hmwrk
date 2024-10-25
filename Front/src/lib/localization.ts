import { createI18n } from 'vue-i18n'
import {
    getLocalStorageItem,
    getSessionStorageItem,
    saveLocalStorageItem,
    saveSessionStorageItem,
} from 'lib/helpers'

/** Extend Navigator with IE specific property. */
type IENavigator = Navigator & { userLanguage: string }

/** Interface for Locale option */
export interface LocaleOption {
    /** Lowercase alpha-2 code */
    Code: string
    /** Localization language name */
    Name: string
}

export type { LocaleMessageObject, TranslateResult } from 'vue-i18n'

/**
 * Returns browser's locale setting as alpha-2 language code.
 */
export function getBrowserLocale(): string | null {
    let browserLocale: string | null = null

    if (window.navigator.languages) {
        // Chrome/FF should have this
        browserLocale = window.navigator.languages[0]
    } else if (window.navigator.language) {
        // Chrome/FF/Safari should have this
        browserLocale = window.navigator.language
    } else if ((window.navigator as IENavigator).userLanguage) {
        // IE should have this
        browserLocale = (window.navigator as IENavigator).userLanguage
    }

    return browserLocale?.trim().split(/-|_/)[0] || null
}

/**
 * Save locale to both Local and Session Storage
 * @param storageKey Key to store the locale in storage
 * @param locale Alpha-2 language code
 */
export function setLocaleToStorage(storageKey: string, locale: string): void {
    saveLocalStorageItem(storageKey, locale)
    saveSessionStorageItem(storageKey, locale)
}

/**
 * Get locale (alpha-2 language code) from storage, Session Storage is prioritized over Local Storage
 *
 * If nothing is found or locale is not actually supported then null value is returned.
 * @param storageKey Key to store the locale in storage
 * @param supportedLocales List of locale options which are supported by solution
 */
export function getLocaleFromStorage(
    storageKey: string,
    supportedLocales: LocaleOption[]
): string | null {
    let storedLocaleCode = getSessionStorageItem<string>(storageKey)

    if (!storedLocaleCode) {
        storedLocaleCode = getLocalStorageItem<string>(storageKey)
    }

    if (supportedLocales.some(loc => loc.Code === storedLocaleCode)) {
        return storedLocaleCode
    }

    return null
}

/**
 * Returns initial locale as alpha-2 language code.
 *
 * First option is to use locale from Storage.
 * Second option is to use browser's locale.
 * Fallback is the first available SupportedLocale.
 * @param storageKey Key to store the locale in storage
 * @param supportedLocales List of locale options which are supported by solution
 */
export function getInitialLocale(storageKey: string, supportedLocales: LocaleOption[]): string {
    const storageLocale = getLocaleFromStorage(storageKey, supportedLocales)
    const browserLocale = getBrowserLocale()

    const isSupportedLocale = (locale: string | null): boolean => {
        return supportedLocales.some(loc => loc.Code === locale)
    }

    if (storageLocale && isSupportedLocale(storageLocale)) {
        // As primary use locale from storage
        return storageLocale
    } else if (browserLocale && isSupportedLocale(browserLocale)) {
        // As secondary use locale from browser
        return browserLocale
    } else {
        // As fallback use first supported locale
        return supportedLocales[0].Code
    }
}

/** Initialize VueI18n to use English by default. Solution should load the locale from storage. */
export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {},
})
