import type { RouteParams, RouteLocationRaw } from 'vue-router'

export type TimerHandle = number

export interface Props {
    /** Menuitem text label */
    label: string | null
    /** Optional Font Awesome icon (set null to disable icon) */
    icon: string | null
    /**
     * Set true to use the default icon from the route object.
     * Not applicable when icon-property is set.
     */
    useDefaultIcon: boolean
    /**
     * Vue-router link (String or Location) where to navigate if user clicks the menuitem
     * If external = true, pass to href
     */
    link: RouteLocationRaw
    /** Named route to navigate to */
    routeName: string
    /** Parameters to pass to the route */
    routeParams: RouteParams
    /** If link is external and not VueRouter link */
    external: boolean
    /** Open in new tab (only applicable to external links) */
    newtab: boolean
    /** Hide menuitem */
    hidden: boolean
    /** Is menuitem disabled */
    disabled: boolean
    /**  Use HoverHelper to ease accessing submenus. */
    useHoverHelper: boolean
    /** Delay (ms) how long the submenu HoverHelper should be visible */
    hideHoverHelperDelay: number
    /** Offset submenu position in X-axis (pixels) */
    subMenuXOffset: number
    /** Offset submenu position in Y-axis (pixels) */
    subMenuYOffset: number
}

export interface Data {
    /** Internal absolute x position in pixels for positioning the submenu on hover */
    submenuX: number
    /** Internal absolute y position in pixels for positioning the submenu on hover */
    submenuY: number
    /** Internal position for hover-helper triangle */
    hoverHelperX: number
    /** Internal width for hover-helper triangle */
    hoverHelperWidth: number
    /** If hover helper is shown */
    showHoverHelper: boolean
    /** Autohide-timer for hover helper */
    showHoverTimer: TimerHandle | undefined
}

export interface Computed {
    /** True if user has permission to see this menu item */
    userHasPermission: boolean
    /** Shows menu item if it isn't hidden and user has permission */
    showMenuItem: boolean
    /** Classes for menuitem element */
    menuClass: {
        'has-submenu': boolean
        disabled: boolean
    }
    /** Style (position left, top) for submenu */
    submenuStyle: {
        top: string
        left: string
    }
    /** Style (position left, width) for submenu */
    hoverHelperStyle: {
        left: string
        width: string
    }
    /** Target for menuitem external link. */
    linkTarget: '_blank' | undefined
    /** Tooltip if showing external link */
    externalLinkTooltip: string
    /** A destination route computed based on link or routeName and params. */
    destination: RouteLocationRaw
    /** Metadata about current route */
    routeMeta: any | null
    /** A computed property return breadcrumb from current route meta. */
    breadcrumb: RouteParams[] | null
    /** A computed icon return icon class that can be come from props or default one. */
    computedIcon: string
    /** A computed label return icon class that can be come from props or default one. */
    computedLabel: string
}

export interface Methods {
    /** Navigation is toggled */
    toggleNav: () => void
    /** Parent will call this if necessary to reposition submenu */
    recalculatePosition: () => void
    /**
     * Calculate submenu position in window
     * @param event
     */
    calculateSubMenuPos: (event: MouseEvent | null) => void
    /**
     * Calculate hoverhelper position in window.
     * Hides after hideHoverHelperDelay ms has elapsed
     *
     * @param event
     */
    repositionHoverHelper: (event: MouseEvent | null) => void
}
