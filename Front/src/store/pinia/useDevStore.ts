import { defineStore } from 'pinia'

// Contains the states that can be used in dev environment
export const useDevStore = defineStore('dev', {
    state: () => ({
        useCachedToken: true,
    }),
})
