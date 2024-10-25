import type { TooltipPlugin } from 'layout/components'
import type { IImageServicePlugin } from 'components/shared/ImageServicePlugin'
import type { Modals } from 'components/shared/Modal/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Pinia store for sharing reactive references to components and plugins between Aibidia Layout components and solutions components.
 * Import this store in a solution, and call methods for setting references.
 */
export const useGlobalRefsStore = defineStore('globalRefs', () => {
    // Internal state for keeping references, which are nulls by default and can be initialised in runtime.
    const stateModals = ref<Modals | null>(null)
    const stateTooltip = ref<TooltipPlugin | null>(null)
    const stateImageService = ref<IImageServicePlugin | null>(null)

    // Getters handle nulls for convenient consumption in calling code.
    const modals = computed<Modals>(() => {
        if (!stateModals.value) {
            throw new Error('Modals are not initialized')
        }

        return stateModals.value
    })

    const tooltip = computed<TooltipPlugin>(() => {
        if (!stateTooltip.value) {
            throw new Error('Tooltips are not initialized')
        }

        return stateTooltip.value
    })

    const imageService = computed<IImageServicePlugin>(() => {
        if (!stateImageService.value) {
            throw new Error('Image service is not initialized')
        }

        return stateImageService.value
    })

    // Setters.
    function setModals(value: Modals): void {
        stateModals.value = value
    }

    function setTooltip(value: TooltipPlugin): void {
        stateTooltip.value = value
    }

    function setImageService(value: IImageServicePlugin): void {
        stateImageService.value = value
    }

    return { modals, setModals, tooltip, setTooltip, imageService, setImageService }
})
