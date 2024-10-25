<template>
    <SideMenuLayout
        v-click-away="handleClickAway"
        :open="isOpen"
        :collapsed="isCollapsed"
        :sticky="isSticky"
        :show-sticky-icon="showStickyIcon"
        :menu-position="menuPosition"
        @mouseover="handleMouseOver"
        @mouseleave="handleMouseLeave"
        @stickyclick="handleStickyChange"
    >
        <template #logo>
            <span>
                <MainLogo
                    data-cy="menu-solution-logo"
                    :small="!isSticky"
                >
                </MainLogo>
            </span>
        </template>

        <template #menuButton>
            <span>
                <button
                    class="a-menu-toggle"
                    :class="{ 'is-open': isOpen }"
                    @click="toggleOpen"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </span>
        </template>

        <SideMenuSection :route-name="$routeNames.General">
            <SideMenuItem
                :route-name="$routeNames.Introduction"
                use-default-icon
            ></SideMenuItem>
            <SideMenuItem
                :route-name="$routeNames.ResumeTable"
                use-default-icon
            ></SideMenuItem>
            <SideMenuItem
                :route-name="$routeNames.ResumeForm"
                use-default-icon
            ></SideMenuItem>
        </SideMenuSection>
    </SideMenuLayout>
</template>

<script lang="ts">
import SideMenu from 'components/shared/SideMenu/SideMenu.vue'
import SideMenuItem from 'components/shared/SideMenu/SideMenuItem.vue'
import SideMenuSection from 'components/shared/SideMenu/SideMenuSection.vue'
import SideMenuLayout from 'components/shared/SideMenu/SideMenuLayout.vue'
import { AppMutations } from 'store/modules/app-store'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import MainLogo from 'components/shared/MainLogo.vue'

enum MenuPositions {
    Left,
    Right,
}

/** Menu containing views related to Layout */
export default defineComponent({
    components: {
        MainLogo,
        SideMenuItem,
        SideMenuSection,
        SideMenuLayout,
    },

    extends: SideMenu,

    props: {
        /** Control sidemenu stickiness default value */
        sticky: {
            type: Boolean,
            default: true,
        },
        /** Show sticky icon in menu (only on uncollapsed state) */
        showStickyIcon: {
            type: Boolean,
            default: true,
        },
        /** Which side of the screen should the menu be placed */
        menuPosition: {
            type: Number as PropType<MenuPositions>,
            default: MenuPositions.Left,
        },
    },

    methods: {
        /** Toggle and save menu sticky value to store */
        handleStickyChange(): void {
            this.toggleSticky()
            this.$store.commit(AppMutations.SET_MENU_STICKY_STATE, this.isSticky)
        },
    },
})
</script>
