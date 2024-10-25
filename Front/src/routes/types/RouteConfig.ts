import type { RouteName } from '../constants'

/** Vuei18n Localization token from en.json like 'views.general.introduction' */
export type LocalizationToken = string
/** FontAwesome font name like 'fa fa-icon' */
export type FontAwesomeIcon = string

/** Solution Vue-Router configuration */
export interface RouteConfig {
    path: string
    name: RouteName
    redirect?: { name: RouteName }
    component: () => Promise<typeof import('*.vue')>
    meta: {
        breadcrumb: [{ name: LocalizationToken; icon: FontAwesomeIcon }]
    }
    children?: RouteConfig[]
}
