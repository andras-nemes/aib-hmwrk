import type { Route } from 'vue-router'

export interface Props {
    /** Route name from Named route constants */
    routeName: string
    /** Raw route object. Only analytics views currently use this prop */
    route: Route | null
}

export interface Computed {
    /** True if user has permission to see this menu item */
    userHasPermission: boolean
    /** Show tab if route exists and user has permission */
    showTab: boolean
    /** Metadata about current route */
    routeMeta: any | null
    /** Resolved route from router or given as a prop */
    computedRoute: Route | string | null
    /** Computed default label if no slot is provided */
    computedLabel: string
}
