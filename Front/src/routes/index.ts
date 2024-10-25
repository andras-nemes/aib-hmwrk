import { nextTick } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { RouteNames } from 'routes/constants'
import { hw } from 'routes/hw'
import { LoginPageMode } from 'misc/constants'
import i18n, { loadLocale } from 'lib/i18n'
import { getRouteBreadcrumbs } from 'lib/helpers/router/getRouteBreadcrumbs'
import { globalApp } from 'src/main'

const routes = [
    { path: '/', redirect: '/client' },
    {
        path: '/client',
        name: RouteNames.ClientRoot,
        component: () => import('components/AppContainer.vue'),
    },
    hw,
    {
        path: '/login',
        name: RouteNames.Login,
        component: () => import('views/user/LoginView.vue'),
        meta: { onlyTenant: true },
        props: {
            pageMode: LoginPageMode.Login,
        },
    },
    {
        path: '/no-access',
        name: RouteNames.NoAccess,
        component: () => import('views/user/LoginView.vue'),
        meta: { onlyTenant: true },
        props: {
            pageMode: LoginPageMode.NotAuthorised,
        },
    },
    {
        path: '/logout/',
        name: RouteNames.Logout,
        component: () => import('views/user/LogoutView.vue'),
    },
    { path: '/code=*', redirect: { name: RouteNames.Introduction } },
    // Handle any other path as 404 - Page not found
    {
        path: '/:catchAll(.*)',
        component: () => import('components/NotFound.vue'),
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    linkActiveClass: 'router-link-active is-active',
    linkExactActiveClass: 'router-link-exact-active is-active',
})

router.afterEach(async to => {
    // Ensure that localizations have been loaded
    if (!Object.keys(i18n.global.messages.value).length) {
        await loadLocale('en')
    }

    nextTick(() => {
        // Allow only greater than zero depths, otherwise default to 1
        const depth = to.meta?.title?.depth > 0 ? to.meta?.title?.depth : 1

        // Get desired depth/count of breadcrumbs to form the title, and localize the values.
        const titleParts = getRouteBreadcrumbs(to)
            .slice(depth * -1)
            .map(bc => i18n.global.t(bc.name).toString())

        // Include the solution name as the default or the last item
        if (globalApp) {
            titleParts.push(globalApp.config.globalProperties.$runtimeEnv.app.title)
        }

        // Join parts of the title
        document.title = titleParts.join(' - ')
    })
})

export default router
export { router, routes }
