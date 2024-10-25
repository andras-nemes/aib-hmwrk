<template>
    <AppLayout
        :initial-breadcrumbs="initialBreadcrumbs"
        :menu-collapsed="!isSavedSticky"
    >
        <!-- Top bar-->
        <template #top-bar>
            <a-top-bar :solution-name="$t('common.solution')"> </a-top-bar>
        </template>

        <!-- Menu -->
        <template #menu>
            <AppSideMenu
                ref="menu"
                :sticky="isSavedSticky"
            >
            </AppSideMenu>
        </template>

        <template #after-content>
            <a-snackbar></a-snackbar>
        </template>
    </AppLayout>
</template>

<script lang="ts">
import AppSideMenu from 'components/AppSideMenu.vue'
import Snackbar from 'components/shared/snackbar/AibidiaSnackbar.vue'
import { defineComponent } from 'vue'
import AppLayout from 'components/shared/AppLayout/AppLayout.vue'
import TopBar from 'components/shared/TopBar.vue'

interface Data {
    /** Is the solution menu set to sticky? */
    menuSticky: boolean
}

export default defineComponent({
    components: {
        AppSideMenu,
        'a-snackbar': Snackbar,
        'a-top-bar': TopBar,
        AppLayout,
    },

    beforeRouteUpdate(to, from, next) {
        if (this.$refs.menu) {
            const menu = this.$refs.menu as unknown as { close: () => void }
            menu.close()
        }

        next()
    },

    data(): Data {
        return {
            menuSticky: false,
        }
    },

    computed: {
        initialBreadcrumbs(): string[] {
            return []
        },

        isSavedSticky(): boolean {
            return this.$store.state.app.menuIsSticky
        },
    },
})
</script>

<style lang="scss" scoped>
.header-items {
    margin-right: 0;
    position: relative;
}

.user-indicator {
    margin-right: 1rem;
}

@media only screen and (min-width: 769px) {
    .header-items {
        margin-right: calc(0.75rem + 4.5px);
    }
}
</style>
lib/globalRefsStore