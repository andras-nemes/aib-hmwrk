import type { MenuPositions } from './constants'

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
