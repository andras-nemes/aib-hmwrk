import type { BreadcrumbItem } from '../../../components/shared/Breadcrumb/BreadcrumbType'
import type { Route, RouteRecord } from 'vue-router'

/** Get breadcrumbs of a Route, including breadcrumbs of all parent routes */
export const getRouteBreadcrumbs = (route: Route): BreadcrumbItem[] => {
    if (!route.matched?.length) {
        return route.meta?.breadcrumb || []
    }

    const breadcrumbs = route?.matched.reduce((acc, rr) => {
        acc.push(...getRouteRecordBreadcrumbs(rr))
        return acc
    }, [] as BreadcrumbItem[])

    return breadcrumbs
}

/** Get breadcrumbs for a RouteRecord */
const getRouteRecordBreadcrumbs = (record: RouteRecord): BreadcrumbItem[] => {
    return record.meta?.breadcrumb || []
}
