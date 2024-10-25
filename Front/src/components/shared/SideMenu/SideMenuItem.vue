<template>
    <li
        v-if="showMenuItem"
        ref="item"
        class="a-menu-item"
        :class="menuClass"
        @click="toggleNav"
        @mousemove="calculateSubMenuPos"
    >
        <router-link
            v-if="!external"
            :to="destination"
            :event="disabled ? '' : 'click'"
        >
            <i
                v-if="computedIcon"
                :class="computedIcon"
            />
            <span>{{ computedLabel }}</span>
        </router-link>
        <a
            v-else
            class="external-link"
            :class="{ disabled: disabled }"
            :href="link"
            :title="externalLinkTooltip"
            :target="linkTarget"
            :disabled="disabled"
            @click="$ev => $emit('click', $ev)"
        >
            <i
                v-if="icon"
                :class="icon"
            />
            <span>{{ computedLabel }}</span>
        </a>
        <section
            v-if="$slots.default"
            ref="submenu"
            class="a-submenu depth-12"
            :class="{ disabled: disabled }"
            :style="submenuStyle"
        >
            <div
                v-if="showHoverHelper"
                ref="hoverhelper"
                class="a-hoverhelper"
                :style="hoverHelperStyle"
                @mousemove.stop.prevent="() => {}"
            />
            <slot />
        </section>
    </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { RouteParams, RouteLocationRaw } from 'vue-router'

export type TimerHandle = number

export interface Props {
    /** Menuitem text label */
    label: string | null
    /** Optional Font Awesome icon (set null to disable icon) */
    icon: string | null
    /**
     * Set true to use the default icon from the route object.
     * Not applicable when icon-property is set.
     */
    useDefaultIcon: boolean
    /**
     * Vue-router link (String or Location) where to navigate if user clicks the menuitem
     * If external = true, pass to href
     */
    link: RouteLocationRaw
    /** Named route to navigate to */
    routeName: string
    /** Parameters to pass to the route */
    routeParams: RouteParams
    /** If link is external and not VueRouter link */
    external: boolean
    /** Open in new tab (only applicable to external links) */
    newtab: boolean
    /** Hide menuitem */
    hidden: boolean
    /** Is menuitem disabled */
    disabled: boolean
    /**  Use HoverHelper to ease accessing submenus. */
    useHoverHelper: boolean
    /** Delay (ms) how long the submenu HoverHelper should be visible */
    hideHoverHelperDelay: number
    /** Offset submenu position in X-axis (pixels) */
    subMenuXOffset: number
    /** Offset submenu position in Y-axis (pixels) */
    subMenuYOffset: number
}

export interface Data {
    /** Internal absolute x position in pixels for positioning the submenu on hover */
    submenuX: number
    /** Internal absolute y position in pixels for positioning the submenu on hover */
    submenuY: number
    /** Internal position for hover-helper triangle */
    hoverHelperX: number
    /** Internal width for hover-helper triangle */
    hoverHelperWidth: number
    /** If hover helper is shown */
    showHoverHelper: boolean
    /** Autohide-timer for hover helper */
    showHoverTimer: TimerHandle | undefined
}

export interface Computed {
    /** True if user has permission to see this menu item */
    userHasPermission: boolean
    /** Shows menu item if it isn't hidden and user has permission */
    showMenuItem: boolean
    /** Classes for menuitem element */
    menuClass: {
        'has-submenu': boolean
        disabled: boolean
    }
    /** Style (position left, top) for submenu */
    submenuStyle: {
        top: string
        left: string
    }
    /** Style (position left, width) for submenu */
    hoverHelperStyle: {
        left: string
        width: string
    }
    /** Target for menuitem external link. */
    linkTarget: '_blank' | undefined
    /** Tooltip if showing external link */
    externalLinkTooltip: string
    /** A destination route computed based on link or routeName and params. */
    destination: RouteLocationRaw
    /** Metadata about current route */
    routeMeta: any | null
    /** A computed property return breadcrumb from current route meta. */
    breadcrumb: RouteParams[] | null
    /** A computed icon return icon class that can be come from props or default one. */
    computedIcon: string
    /** A computed label return icon class that can be come from props or default one. */
    computedLabel: string
}

export interface Methods {
    /** Navigation is toggled */
    toggleNav: () => void
    /** Parent will call this if necessary to reposition submenu */
    recalculatePosition: () => void
    /**
     * Calculate submenu position in window
     * @param event
     */
    calculateSubMenuPos: (event: MouseEvent | null) => void
    /**
     * Calculate hoverhelper position in window.
     * Hides after hideHoverHelperDelay ms has elapsed
     *
     * @param event
     */
    repositionHoverHelper: (event: MouseEvent | null) => void
}

/**
 * Reusable SideMenuItem component.
 */
export default defineComponent({
    name: 'SideMenuItem',

    props: {
        /** Menuitem text label */
        label: {
            type: String,
            default: null,
        },
        /** Optional Font Awesome icon (set null to disable icon) */
        icon: {
            type: String,
            default: null,
        },
        /**
         * Vue-router link (String or Location) where to navigate if user clicks the menuitem
         * If external = true, pass to href
         */
        link: {
            type: [String, Object] as PropType<RouteLocationRaw>,
            default: null,
        },
        /** If link is external and not VueRouter link */
        external: {
            type: Boolean,
            default: false,
        },
        /** Open in new tab (only applicable to external links) */
        newtab: {
            type: Boolean,
            default: false,
        },
        /** Hide menuitem */
        hidden: {
            type: Boolean,
            default: false,
        },
        /**  Use HoverHelper to ease accessing submenus. */
        useHoverHelper: {
            type: Boolean,
            default: true,
        },
        /** Delay (ms) how long the submenu HoverHelper should be visible */
        hideHoverHelperDelay: {
            type: Number,
            default: 750,
        },
        /** Offset submenu position in X-axis (pixels) */
        subMenuXOffset: {
            type: Number,
            default: -8,
        },
        /** Offset submenu position in Y-axis (pixels) */
        subMenuYOffset: {
            type: Number,
            default: -4,
        },
        /** Is menuitem disabled */
        disabled: {
            type: Boolean,
            default: false,
        },
        /** Named route to navigate to */
        routeName: {
            type: String,
            default: null,
        },
        /** Parameters to pass to the route */
        routeParams: {
            type: Object as PropType<RouteParams>,
            default: undefined,
        },
        /**
         * Set true to use the default icon from the route object.
         * Not applicable when icon-property is set.
         */
        useDefaultIcon: {
            type: Boolean,
            default: false,
        },
    },

    emits: ['click', 'toggle-nav'],

    data(): Data {
        return {
            submenuX: 0,
            submenuY: 0,
            hoverHelperX: 0,
            hoverHelperWidth: 0,
            showHoverHelper: false,
            showHoverTimer: undefined,
        }
    },

    computed: {
        /** True if user has permission to see this menu item */
        userHasPermission(): boolean {
            // By default allow access if;
            // - Route doesn't have permissions defined.
            // - Permission validation method is not defined.
            if (
                !this.$user ||
                !this.routeMeta?.permission ||
                typeof this.$user?.HasPermission !== 'function'
            ) {
                return true
            }

            return this.$user.HasPermission(this.routeMeta.permission)
        },

        /** Shows menu item if it isn't hidden and user has permission */
        showMenuItem(): boolean {
            return !this.hidden && this.userHasPermission
        },

        /** Classes for menuitem element */
        menuClass() {
            return {
                'has-submenu': !!this.$slots.default,
                disabled: this.disabled,
            }
        },

        /** Style (position left, top) for submenu */
        submenuStyle() {
            return {
                left: this.submenuX + 'px',
                top: this.submenuY + 'px',
            }
        },

        /** Style (position left, width) for submenu */
        hoverHelperStyle() {
            return {
                left: this.hoverHelperX + 'px',
                width: this.hoverHelperWidth + 'px',
            }
        },

        /** Target for menuitem external link. */
        linkTarget(): '_blank' | undefined {
            if (this.newtab) {
                return '_blank'
            }

            return undefined
        },

        /** Tooltip if showing external link */
        externalLinkTooltip(): string {
            const term = this.newtab
                ? 'components.actions.open-external-link-in-new-tab.title'
                : 'components.actions.go-to-external-link.title'

            return this.$t(term, { link: this.link }).toString()
        },

        /** A destination route computed based on link or routeName and params. */
        destination(): RouteLocationRaw {
            if (typeof this.link === 'string') {
                return {
                    path: this.link,
                }
            }

            if (this.routeName) {
                return {
                    name: this.routeName,
                    params: this.routeParams,
                }
            }

            return {}
        },

        /** Metadata about current route */
        routeMeta(): any | null {
            if (!this.$router) {
                return null
            }

            const route = this.$router.resolve({ name: this.routeName, params: this.routeParams })
            // Route might follow redirect from category level to page level, so the correct metadata is in route.matched
            const match = route?.matched.find(r => r.name === this.routeName)
            if (match?.meta) {
                return match.meta
            }

            // If not matched, and the route has meta, return it
            if (!route?.meta) {
                return route.meta
            }

            return null
        },

        /** A computed property return breadcrumb from current route meta. */
        breadcrumb(): RouteParams[] | null {
            if (this.routeMeta?.breadcrumb?.length) {
                return this.routeMeta.breadcrumb
            }

            return null
        },

        /** A computed icon return icon class that can be come from props or default one. */
        computedIcon(): string {
            if (this.icon) {
                return this.icon
            }

            // Try to get icon from route meta data
            if (this.useDefaultIcon && this.routeName) {
                if (this.breadcrumb) {
                    return this.breadcrumb[this.breadcrumb.length - 1].icon || ''
                }
            }

            return ''
        },

        /** A computed label return icon class that can be come from props or default one. */
        computedLabel(): string {
            if (this.label) {
                return this.label
            }

            // Try to get label from route meta data
            if (this.routeName) {
                if (this.breadcrumb) {
                    const name = this.breadcrumb[this.breadcrumb.length - 1].name
                    // Check that $t (and thus i18n) is defined
                    if (typeof this.$t === 'function') {
                        return this.$t(name).toString()
                    }

                    return name || ''
                }
            }

            return 'label'
        },
    },

    mounted() {
        this.calculateSubMenuPos(null)
    },

    beforeUnmount() {
        clearTimeout(this.showHoverTimer)
    },

    methods: {
        /** Navigation is toggled */
        toggleNav(): void {
            this.$emit('toggle-nav')
        },

        /** Parent will call this if necessary to reposition submenu */
        recalculatePosition(): void {
            this.calculateSubMenuPos(null)
        },

        /**
         * Calculate submenu position in window
         * @param event
         */
        calculateSubMenuPos(event: MouseEvent | null): void {
            // Require that refs still exists
            const submenu = this.$refs.submenu as Element
            if (!submenu) {
                return
            }

            const item = this.$refs.item as Element
            if (!item) {
                return
            }

            // Get the item position
            const pos = item.getBoundingClientRect()
            this.submenuX = pos.left + pos.width + this.subMenuXOffset
            this.submenuY = pos.top + this.subMenuYOffset

            // Get the submenu position
            const subpos = submenu.getBoundingClientRect()
            if (this.submenuY + subpos.height > window.innerHeight) {
                this.submenuY = this.submenuY - subpos.height + pos.height + this.subMenuYOffset
            }

            this.repositionHoverHelper(event)
        },

        /**
         * Calculate hoverhelper position in window.
         * Hides after hideHoverHelperDelay ms has elapsed
         *
         * @param event
         */
        repositionHoverHelper(event: MouseEvent | null): void {
            // If no event, or we are not using hoverhelper then just return
            if (!event || !this.useHoverHelper) {
                return
            }

            // Activate submenu hover helper
            const mx = event.clientX
            this.hoverHelperWidth = this.submenuX - mx
            this.hoverHelperX = -this.hoverHelperWidth
            this.showHoverHelper = this.hoverHelperWidth > 5

            // HideHoverHelper after short delay
            clearTimeout(this.showHoverTimer)

            this.showHoverTimer = setTimeout(() => {
                this.showHoverHelper = false
            }, this.hideHoverHelperDelay) as unknown as TimerHandle
        },
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

.a-sidemenu:not(.is-collapsed) {
    .a-menu-item {
        > a.is-active {
            background: theme.$sidemenu-menuitem-bg-active;
        }

        &:hover > a {
            background: theme.$sidemenu-menuitem-bg-hover;
        }

        &:hover > a.is-active {
            background: theme.$sidemenu-menuitem-bg-active-hover;
        }
        > a:focus {
            box-shadow: theme.$ring-gray;
        }
    }
}

.a-sidemenu.is-collapsed {
    .a-menu-item {
        > a.is-active > i {
            background: theme.$sidemenu-menuitem-bg-active;
        }
        &:hover > a > i {
            background: theme.$sidemenu-menuitem-bg-hover;
        }

        &:hover > a.is-active > i {
            background: theme.$sidemenu-menuitem-bg-active-hover;
        }
        > a:focus > i {
            box-shadow: theme.$ring-gray;
        }
    }
}

.a-menu-item {
    user-select: none;
    cursor: pointer;

    > a {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: center;
        text-decoration: none;

        font-weight: 600;

        border-radius: theme.$button-border-radius;
        background: theme.$sidemenu-menuitem-bg;
        color: theme.$sidemenu-menuitem-color;
        padding-right: 0.75em;
        margin-left: theme.$default-padding;
        margin-right: theme.$default-padding;

        &:focus {
            outline: none;
        }

        > i {
            color: theme.$sidemenu-menuitem-icon-color;
            border-radius: theme.$button-border-radius;
            text-align: center;
            min-width: 22px;
            pointer-events: none;
            opacity: 0.9;
            padding: 0.75em 0.5em;
        }

        > span {
            align-self: baseline;
            pointer-events: none;
            padding: 0.75em 0;
        }
    }

    > a.is-active {
        font-weight: 800;
        pointer-events: none;
    }

    > a.is-active,
    > a.is-active > i {
        color: theme.$sidemenu-menuitem-color-active;
    }

    &:hover > a.is-active,
    &:hover > a.is-active > i {
        color: theme.$sidemenu-menuitem-color-active-hover;
    }

    &.disabled {
        > a {
            opacity: 0.5;
        }
    }

    > .a-submenu {
        margin-top: -8px;
        position: fixed;
        transform-origin: top;
        animation-fill-mode: forwards;
        display: block;
        z-index: 1;
        min-width: 220px;

        background: theme.$sidemenu-submenu-bg;
        border-radius: theme.$sidemenu-submenu-border-radius;
        padding-top: theme.$default-content-padding;
        padding-bottom: theme.$default-content-padding;
        text-align: left;
        visibility: hidden;
        opacity: 0;
        transition: visibility 220ms linear;

        .a-menu-item {
            > a {
                padding-left: 0.75em;
                background: theme.$sidemenu-submenu-menuitem-bg;
                color: theme.$sidemenu-submenu-menuitem-color;
            }

            a.is-active {
                background: theme.$sidemenu-submenu-menuitem-bg-active;
                color: theme.$sidemenu-submenu-menuitem-color-active;
            }

            &:hover > a {
                background: theme.$sidemenu-submenu-menuitem-bg-hover;
                color: theme.$sidemenu-submenu-menuitem-color-hover;
            }

            &:hover > a.is-active {
                background: theme.$sidemenu-submenu-menuitem-bg-active-hover;
                color: theme.$sidemenu-submenu-menuitem-color-active-hover;
            }
        }
    }

    &:hover > .a-submenu {
        visibility: visible;
        opacity: 1;
        transition: visibility 40ms linear;

        > .a-hoverhelper {
            top: 28px;
            height: 100%;
            clip-path: polygon(0 0, 100% 100%, 100% 0);
            // To view the polygon, uncomment following background
            //background: #0000ff44;
            position: absolute;
        }
    }
}

@media only screen and (max-width: 768px) {
    .a-menu-item.has-submenu > .a-submenu {
        display: none;
    }
}

@media only screen and (min-width: 769px) {
    .a-menu-item.has-submenu {
        > a:after {
            display: block;
            flex-grow: 1;
            text-align: right;
            font-family: 'Font Awesome 5 Free';
            content: '\f105' !important;
            font-weight: 900;
        }
    }
}
</style>
