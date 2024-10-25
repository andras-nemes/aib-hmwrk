import type { RouteNames } from 'routes/constants'
import type { Route } from 'vue-router'
import type { VueRouter } from 'vue-router/types/router'
import type { HomeworkApi } from 'lib/api/types/Api'
import type { ItemsResult } from 'types/ModalItemResult'
import type { RuntimeEnv } from 'runtime/RuntimeEnv'

interface Modals {
    confirm: {
        delete: (options: unknown) => Promise<boolean> | Promise<ItemsResult>
        okcancel: (options: unknown) => Promise<boolean> | Promise<ItemsResult>
        warning: (options: unknown) => Promise<boolean> | Promise<ItemsResult>
        tokenExpired: (options?: unknown) => Promise<'login' | 'logout'>
    }
    info: {
        show: (options: unknown) => Promise<boolean> | Promise<ItemsResult>
    }
    edit: {
        closeAll: () => void
        crud: (options: unknown) => Promise<boolean> | Promise<ItemsResult> | Promise<string | null>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $homeworkApi: HomeworkApi
        $routeNames: typeof RouteNames
        $runtimeEnv: RuntimeEnv
        $route: Route
        $router: VueRouter
        $modals: Modals
    }
}

declare module 'vue/types/vue' {
    interface VueConstructor {
        $router: VueRouter
        prototype: {
            $routeNames: typeof RouteNames
            $homeworkApi: HomeworkApi
            $runtimeEnv: RuntimeEnv
            $modals: Modals
        }
    }
}
