/**
 * Helper functions
 */

// Core
export { coerceKey } from './helpers/core/coerceKey'
export { isEmpty } from './helpers/core/isEmpty'
export { getErrorMsgAndType } from './helpers/core/getErrorMsgAndType'
export { logActionDuration } from './helpers/core/logActionDuration'
export { PromiseRepeater } from './helpers/core/PromiseRepeater'

// Array
export { sumPropertyValue } from './helpers/arrays/sumPropertyValue'

// Object
export { groupBy } from './helpers/objects/groupBy'
export { searchProperties } from './helpers/objects/searchProperties'

// Strings
export { matchValue } from './helpers/strings/matchValue'
export { deAccent } from './helpers/strings/deAccent'
export { createTemporaryKey } from './helpers/strings/createTemporaryKey'

// Storage
export { getStorageItem } from './helpers/storage/getStorageItem'
export { saveStorageItem } from './helpers/storage/saveStorageItem'

// LocalStorage
export { getLocalStorageItem } from './helpers/storage/getLocalStorageItem'
export { saveLocalStorageItem } from './helpers/storage/saveLocalStorageItem'

// SessionStorage
export { getSessionStorageItem } from './helpers/storage/getSessionStorageItem'
export { saveSessionStorageItem } from './helpers/storage/saveSessionStorageItem'

// Cookie
export { cookieExists, removeCookie, SameSite, setCookie } from './helpers/core/cookieHandling'
