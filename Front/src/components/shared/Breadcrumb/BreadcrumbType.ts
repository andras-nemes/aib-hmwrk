import type { TranslateResult } from 'vue-i18n'

export interface BreadcrumbItem {
    /** Name of breadcrumb item */
    name: string
    /** Icon of breadcrumb item */
    icon?: string
    /** Flag to set breadcrumb as a clickable link (not clickable by default) */
    clickable?: boolean
}

export interface Breadcrumb {
    /** Router path of the breadcrumb or null, if the breadcrumb is not a route link. */
    path: string | null
    /** Name of breadcrumb */
    name: TranslateResult
    /** Router name of breadcrumb */
    routeName: string | null
    /** Flag to set breadcrumb as a clickable link (not clickable by default) */
    clickable?: boolean
}

export interface BreadcrumbMetaObject {
    meta: {
        /** Contain the list of breadcrumb items */
        breadcrumb: BreadcrumbItem[]
    }
}
