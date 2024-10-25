import type { RootState, RootGetters } from 'store/root-store/modules'
import { modules } from 'store/root-store/modules'
import { LOAD_USER_SETTINGS } from 'store/root-store/mutations'
import { createStore, useStore as baseUseStore } from 'vuex'
import type { Store } from 'vuex'
import type { InjectionKey } from 'vue'

export interface HomeworkStore extends Store<RootState> {
    getters: RootGetters
}

export const key: InjectionKey<HomeworkStore> = Symbol()

export const LoadUserSettings = 'LOAD_USER_SETTINGS'

const store = createStore({
    modules,
    mutations: {
        [LoadUserSettings]: LOAD_USER_SETTINGS,
    },
    strict: process.env.NODE_ENV !== 'production',
})

export function useStore(): HomeworkStore {
    return baseUseStore(key)
}

export default store
