<template>
    <ai-app id="homework">
        <AppLoader
            v-if="isLoading"
            :message="appLoadingMessage"
            :error="appLoadingError"
        >
            <template #slogan> Homework </template>
            <template #description> Aibidia Homework </template>
        </AppLoader>
        <router-view
            v-show="!isLoading"
        ></router-view>
    </ai-app>
</template>

<script lang="ts">
import { AppLoadingMessages } from 'misc/constants'
import { RouteNames } from 'routes/constants'
import type { AppLoadingError } from 'components/shared/AppLoader/AppLoader'
import { isNavigationFailure } from 'vue-router'
import { LoadUserSettings } from './store'
import { defineComponent } from 'vue'
import { AppMutations } from 'store/modules/app-store'
import AppLoader from 'components/shared/AppLoader/AppLoader.vue'

interface Data {
    appLoadingMessage: AppLoadingMessages
    appLoadingError: AppLoadingError | null
    isLoading: boolean
    initialDataLoaded: boolean
}

export default defineComponent({
    name: 'App',

    components: {
        AppLoader,
    },

    data(): Data {
        return {
            appLoadingMessage: AppLoadingMessages.Loading,
            appLoadingError: null,
            isLoading: true,
            initialDataLoaded: false,
        }
    },
    watch: {
        '$route.path': {
            handler: function (to, from) {
                if (!from || this.$route?.name === RouteNames.ClientRoot) {
                    this.handleApplicationInitialLoad()
                    return
                }
            },
            immediate: true,
        },
    },

    async mounted() {
        this.isLoading = true
    },

    methods: {
        /** Handles application initial load */
        async handleApplicationInitialLoad(): Promise<void> {
            if (this.$route.name === RouteNames.Login) {
                try {
                    await this.$router.replace({
                        name: RouteNames.Introduction,
                    })
                } catch (error) {
                    if (!isNavigationFailure(error)) {
                        throw error
                    }
                }
            }

            let toPage = this.$route.name || RouteNames.Introduction

            try {
                toPage = toPage === RouteNames.ClientRoot ? RouteNames.Introduction : toPage

                await this.$router.push({
                    name: toPage,
                })
            } catch (error) {
                if (!isNavigationFailure(error)) {
                    throw error
                }
            }

            try {
                this.$store.commit(AppMutations.SET_SHOULD_LOAD_DATA, false)
                await this.loadInitialData()
            } catch (e) {
                this.$store.commit(AppMutations.SET_SHOULD_LOAD_DATA, true)
            }
        },

        async loadInitialData(): Promise<void> {
            await this.$store.commit(LoadUserSettings)
            this.isLoading = false
        },
    },
})
</script>
