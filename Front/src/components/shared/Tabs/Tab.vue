<template>
    <router-link
        v-if="showTab"
        class="a-tab"
        :to="computedRoute"
        active-class="is-active"
    >
        <slot>
            <span> {{ computedLabel }} </span>
        </slot>
    </router-link>
</template>

<script lang="ts">
import type { Route } from 'vue-router'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
/**
 * Component to show tab as UL-list LI item.
 */
export default defineComponent({
    props: {
        /** Route name from Named route constants */
        routeName: {
            type: String,
            default: null,
        },
        /** Raw route object. Only analytics views currently use this prop */
        route: {
            type: Object as PropType<Route>,
            default: null,
        },
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

        /** Show tab if route exists and user has permission */
        showTab(): boolean {
            return !!this.computedRoute && this.userHasPermission
        },

        /** Resolved route from router or given as a prop */
        computedRoute(): Route | string | null {
            if (this.route) {
                return this.route
            }

            if (this.$router && this.routeName?.length) {
                return this.$router.resolve({ name: this.routeName })
            }

            return null
        },

        /** Metadata about current route */
        routeMeta(): any | null {
            if (
                !this.$router ||
                !this.computedRoute ||
                typeof this.computedRoute == 'string' ||
                !this.routeName
            ) {
                return null
            }

            // Route might follow redirect from category level to page level, so the correct metadata is in route.matched
            const match = this.computedRoute.matched.find(r => r.name === this.routeName)
            if (match?.meta) {
                return match.meta
            }

            // If not matched, return the potential route meta
            return this.computedRoute.meta
        },

        /** Computed default label if no slot is provided */
        computedLabel(): string | undefined {
            const breadcrumb = this.routeMeta?.breadcrumb

            if (!breadcrumb) {
                return
            }

            // Try to get label from route meta data
            if (breadcrumb.length) {
                const name = breadcrumb[breadcrumb.length - 1].name
                // Check that $t (and thus i18n) is defined
                if (typeof this.$t === 'function') {
                    return this.$t(name) as string
                }

                return name || ''
            }

            return 'Tab'
        },
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
// Note, we use a-tab class here instead of ai-tab as we want the tab to open like a anchor link.
.a-tab {
    display: block;
    text-align: center;

    color: theme.$tabs-tab-color;
    background: theme.$tabs-tab-bg;

    border-bottom: 1px solid theme.$grey-lighter;

    font-weight: 700;
    font-size: 1.1em;
    padding: 0.3em;

    cursor: pointer;
    padding-left: 1em;
    padding-right: 1em;

    // Text wrapping
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-decoration: none;

    &:hover {
        color: theme.$tabs-tab-color-hover;
        background: theme.$tabs-tab-bg-hover;
        border-bottom: 2px solid theme.$tabs-tab-color-active;
        padding-bottom: calc(0.3em - 1px);
    }

    &:focus {
        border-bottom: 2px solid theme.$primary-lighter;
        padding-bottom: calc(0.3em - 1px);
        outline: none;
    }

    &.is-active {
        color: theme.$tabs-tab-color-active;
        background: theme.$tabs-tab-bg-active;
        border-bottom: 2px solid theme.$tabs-tab-color-active;
        padding-bottom: calc(0.3em - 1px);
    }

    &.is-active:hover {
        color: theme.$tabs-tab-color-active-hover;
        background: theme.$tabs-tab-bg-active-hover;
    }
}
</style>
