import type { OverlayButton } from 'components/OverlayButtons.vue'

export interface OverlayContent {
    /** Content to display in UI */
    text: string
    /** List of buttons are displayed in the overlay */
    buttons?: OverlayButton[]
}
