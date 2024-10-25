import { createApp } from 'vue'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import 'assets/sass/aibidia.scss'
import App from 'src/App.vue'
import router from 'routes/index'
import i18n from 'lib/i18n'
import store from 'store/index'
import createAppApi from 'lib/api/createAppApi'
import { AppMutations } from 'store/modules/app-store'
import { StorageKey } from 'misc/constants'
import { saveLocalStorageItem } from 'lib/helpers'
import { key } from 'store/index'
import type { App as TypeApp } from 'vue'
import { RouteNames } from 'routes/constants'
import { createPinia } from 'pinia'

export let globalApp: TypeApp | null = null

async function initApp(): Promise<void> {
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(i18n)
    app.use(store, key)
    app.use(router)

    app.config.globalProperties.$routeNames = RouteNames
    app.config.globalProperties.$user = null

    const env = window.RUNTIME_ENV
    app.config.globalProperties.$runtimeEnv = env

    if (process.env.NODE_ENV === 'production') {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        console.log = function () {}
    }

    const homeworkApi = createAppApi(env.api.solution)
    app.config.globalProperties.$homeworkApi = homeworkApi

    app.config.globalProperties.$router = router


    // Subscribe to mutations
    store.subscribe(async (mutation, state) => {
        switch (mutation.type) {
            case AppMutations.SET_MENU_STICKY_STATE:
                saveLocalStorageItem(StorageKey.MenuSticky, state.app.menuIsSticky)
                break
            default:
                break
        }
    })

    document.title = env.app.title
    globalApp = app

    // To avoid a race condition, wait for the router to be ready before mounting the app
    await router.isReady()

    app.mount('#homework')
}

initApp()
