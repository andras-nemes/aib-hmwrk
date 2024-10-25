<script lang="ts">
import clickAway from 'vue3-click-away'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

/** Which side the menu is located */
export enum MenuPositions {
    Left,
    Right,
}

export const TabletLayoutMinWidth = 768

export interface ComponentClass {
    [className: string]: boolean
}

export interface Data {
    /** Internal state for stickiness */
    isSticky: boolean
    /** Internal state for openness (mobile menu) */
    isOpen: boolean
    /** Internal state for collapsed */
    isCollapsed: boolean
    /**
     * Prevent collapsing. Used to prevent collapse happening if
     * collapse state just have been changed.
     */
    preventCollapse: boolean
}

export interface Methods {
    /** Expand sidemenu from collapsed state (only if not sticky) */
    expand: () => void
    /** Collapse sidemenu from uncollapsed state (only if not sticky) */
    collapse: () => void
    /** Keep sidemenu uncollapsed by toggling Sticky state */
    toggleSticky: () => void
    /** Expand menu on mouseover */
    handleMouseOver: () => void
    /** Collapse menu on mouseleave */
    handleMouseLeave: () => void
    /** Handler when user clicks away from the side menu dom element */
    handleClickAway: () => void
    /** Close menu on resize if screen inner width is bigger than tablet layout's minWidth (switching out of tablet layout) */
    handleResize: (width: number) => void
    /**
     * Set collapse state to value.
     * @param value Value of collapse state
     */
    setCollapse: (value: boolean) => void
    /** Toggle open state menu (mobile menu) */
    toggleOpen: () => void
    /** Closes menu (mobile menu) */
    close: () => void
}

export interface MenuProps {
    /** Control sidemenu stickiness default value */
    sticky: boolean
    /** Show sticky icon in menu (only on uncollapsed state) */
    showStickyIcon: boolean
    /** Which side of the screen should the menu be placed */
    menuPosition: MenuPositions
}

/**
 * This component is responsible for expand/collapse and open/close logic of AibidiaSideMenuLayout.
 * Stickiness = Do not collapse menu on mouse leave.
 * Collapse = Minimize to icons (SolutionMenu) or disappear (PlatformMenu).
 */
export default defineComponent({
    directives: {
        clickAway,
    },

    props: {
        /** Control sidemenu stickiness default value */
        sticky: {
            type: Boolean,
            default: true,
        },
        /** Show sticky icon in menu (only on uncollapsed state) */
        showStickyIcon: {
            type: Boolean,
            default: true,
        },
        /** Which side of the screen should the menu be placed */
        menuPosition: {
            type: Number as PropType<MenuPositions>,
            default: MenuPositions.Left,
        },
    },

    emits: ['open:change', 'sticky:change', 'collapse:change'],

    data(): Data {
        return {
            isSticky: this.sticky,
            isOpen: false,
            isCollapsed: false,
            preventCollapse: false,
        }
    },

    watch: {
        /**
         * Watcher for external sticky state
         */
        sticky(newVal) {
            this.isSticky = newVal
            if (!this.isSticky && !this.preventCollapse) {
                this.collapse()
            }
        },
    },

    mounted() {
        // By default, let's collapse
        this.collapse()
        this.$emit('open:change', this.isOpen)
        window.addEventListener('resize', () => this.handleResize(window.innerWidth))
    },

    methods: {
        /** Expand sidemenu from collapsed state (only if not sticky) */
        expand(): void {
            if (this.isCollapsed && !this.isSticky) {
                this.setCollapse(false)
            }
        },

        /** Collapse sidemenu from uncollapsed state (only if not sticky) */
        collapse(): void {
            if (!this.isCollapsed && !this.isSticky) {
                this.setCollapse(true)
            }
        },

        /** Keep sidemenu uncollapsed by toggling Sticky state */
        toggleSticky(): void {
            // Ensure we are not collapsing while toggling
            this.preventCollapse = true

            // Actual toggle
            this.isSticky = !this.isSticky

            // Emit the event
            this.$emit('sticky:change', this.isSticky)

            // Make sure window is getting resize notification, so app can adjust
            window.dispatchEvent(new Event('resize'))
            this.$nextTick(() => {
                // Once all is done, we can resume allowing collapses
                this.preventCollapse = false
            })
        },

        /** Expand menu on mouseover */
        handleMouseOver(): void {
            this.expand()
        },

        /** Collapse menu on mouseleave */
        handleMouseLeave(): void {
            // Check that we are not switching the stickiness
            if (!this.isOpen && !this.preventCollapse) {
                this.collapse()
            }
        },

        /** Handler when user clicks away from the side menu dom element */
        handleClickAway(): void {
            // Check that we are not switching the stickiness
            if (!this.isOpen && !this.preventCollapse) {
                this.collapse()
            }
        },

        /** Close menu on resize if screen inner width is bigger than tablet layout's minWidth (switching out of tablet layout) */
        handleResize(width: number): void {
            if (width > TabletLayoutMinWidth && !this.preventCollapse) {
                this.close()
                this.collapse()
            }
        },

        /**
         * Set collapse state to value.
         * @param value Value of collapse state
         */
        setCollapse(value: boolean): void {
            this.isCollapsed = value
            this.$emit('collapse:change', value)
        },

        /** Toggle open state menu (mobile menu) */
        toggleOpen(): void {
            this.isOpen = !this.isOpen
            this.$emit('open:change', this.isOpen)
        },

        /** Closes menu (mobile menu) */
        close(): void {
            this.isOpen = false
            this.$emit('open:change', this.isOpen)
        },
    },
})
</script>
