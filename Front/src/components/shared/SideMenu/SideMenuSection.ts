import type { RouteParams } from 'vue-router'

export interface Data {
    /** Internal state if the section is collapsed */
    isCollapsed: boolean
}

export interface Props {
    /** Named route this section represents */
    routeName: string
    /** Section text label */
    label: string | null
    /** Is this menu section collapsible or not */
    collapsible: boolean
    /** Is the menu section minimizable when collapsed or not */
    minimizable: boolean
}

export interface Methods {
    /** Collapse sidemenu section programmatically. */
    collapse: () => void
    /** Uncollapse sidemenu section programmatically. */
    uncollapse: () => void
    /** Toggle sidemenu section collapse state */
    toggleCollapse: () => void
    /** Recalculate all child submenu positions in default slot */
    recalculatePosition: () => void
}

export interface Computed {
    /** Metadata about current route */
    routeMeta: any | null
    /** True if user has permission to see this menu item */
    userHasPermission: boolean
    /** Shows menu section if user has permission */
    showMenuSection: boolean
    /** A computed property return breadcrumb from current route meta. */
    breadcrumb: RouteParams[] | null
    /** A computed label from either props or the default one from route. */
    computedLabel: string
}
