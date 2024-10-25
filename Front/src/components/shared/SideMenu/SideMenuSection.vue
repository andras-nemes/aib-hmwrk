<template>
    <section
        v-if="showMenuSection"
        class="a-menu-section"
    >
        <div
            class="a-menu-header"
            :class="{ collapsible: collapsible, minimizable: minimizable }"
            @click="toggleCollapse"
        >
            <div class="label">
                <span>{{ computedLabel }}</span>
                <i
                    v-if="collapsible"
                    class="fas toggle-arrow"
                    :class="{
                        'fa-caret-down': isCollapsed,
                        'fa-caret-up': !isCollapsed,
                    }"
                />
            </div>
        </div>
        <ul v-show="!isCollapsed">
            <slot />
        </ul>
    </section>
</template>

<script lang="ts">
import type { Component } from 'vue'
import type { Data } from './SideMenuSection'
import { defineComponent } from 'vue'
import type { RouteParams } from 'vue-router'

/** Interface for objects that have recalculatePosition function */
interface HasRecalculatePosition {
    recalculatePosition: () => void
}

/** Type guard for checking recalculatePosition function exists in component before calling it */
function CanCalculatePosition(
    component: Component | HasRecalculatePosition
): component is HasRecalculatePosition {
    return typeof (component as HasRecalculatePosition).recalculatePosition === 'function'
}

/**
 * Collapseable sidemenu section
 */
export default defineComponent({
    props: {
        /** Section text label */
        label: {
            type: String,
            default: null,
        },
        /** Named route this section represents */
        routeName: {
            type: String,
            default: null,
        },
        /** Is this menu section collapsible or not */
        collapsible: {
            type: Boolean,
            default: true,
        },
        /** Is the menu section minimizable when collapsed or not */
        minimizable: {
            type: Boolean,
            default: true,
        },
    },

    emits: ['section:collapse', 'section:uncollapse'],

    data(): Data {
        return {
            isCollapsed: false,
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

        /** Shows menu section if user has permission */
        showMenuSection(): boolean {
            return this.userHasPermission
        },

        /** A computed label from either props or the default one from route. */
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

            return 'Section'
        },

        /** Metadata about current route */
        routeMeta(): any | null {
            if (!this.$router) {
                return null
            }

            const route = this.$router.resolve({ name: this.routeName })
            // Route might follow redirect from category level to page level, so the correct metadata is in route.matched
            const match = route?.matched.find(r => r.name === this.routeName)
            if (match?.meta) {
                return match.meta
            }

            // If not matched, return the potential route meta
            return route?.meta || null
        },

        /** A computed property return breadcrumb from current route meta. */
        breadcrumb(): RouteParams[] | null {
            if (this.routeMeta?.breadcrumb?.length) {
                return this.routeMeta.breadcrumb
            }

            return null
        },
    },

    methods: {
        /** Collapse sidemenu section programmatically. */
        collapse(): void {
            if (!this.collapsible) {
                return
            }

            this.isCollapsed = true
            this.$emit('section:collapse')
        },

        /** Uncollapse sidemenu section programmatically. */
        uncollapse(): void {
            if (!this.collapsible) {
                return
            }

            this.isCollapsed = false
            this.$emit('section:uncollapse')
        },

        /** Toggle sidemenu section collapse state */
        toggleCollapse(): void {
            if (!this.collapsible) {
                return
            }

            if (this.isCollapsed) {
                this.uncollapse()
            } else {
                this.collapse()
            }
        },

        /** Recalculate all child submenu positions in default slot */
        recalculatePosition(): void {
            const elements = this.$slots.default

            if (!elements) {
                return
            }

            for (let i = 0; i < elements.length; i++) {
                const el = elements[i]
                if (el && el.componentInstance) {
                    const component = el.componentInstance
                    if (CanCalculatePosition(component)) {
                        component.recalculatePosition()
                    }
                }
            }
        },
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
.a-menu-section {
    margin-bottom: 12px;
    flex-grow: 0;
    padding-top: 5px;
    padding-bottom: 5px;
    margin-left: theme.$default-padding;
    margin-right: theme.$default-padding;

    &:not(:first-child) {
        margin-top: 12px;
    }

    ul {
        margin: 0;
        padding: 0;
        list-style: none;
        line-height: 1.25;
    }

    > .a-menu-header {
        > .label {
            background: theme.$sidemenu-section-header-bg;
            color: theme.$sidemenu-section-header-color;
            border-radius: theme.$sidemenu-section-header-border-radius;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.96px;
            text-transform: uppercase;
            line-height: 18px;

            margin: 0;
            padding: 0;
            padding-left: 15px;
            padding-right: 5px;
            transition: padding 0.3s, margin 0.3s;
            user-select: none;

            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        &.collapsible {
            cursor: pointer;

            .toggle-arrow {
                padding-right: 3px;
                padding-left: 6px;
                cursor: pointer;
            }
            &:hover {
                background: theme.$sidemenu-section-header-bg-hover;
            }
        }
    }

    ai-field-group,
    ai-field {
        display: flex;
        flex-direction: column;
        line-height: 1.25em;

        label {
            align-self: flex-start;
            color: theme.$sidemenu-section-header-color;
            font-size: 0.7em;
            font-weight: 300;
            letter-spacing: 0.18em;
            text-transform: uppercase;
        }

        .value {
            align-content: center;
        }

        &.label-field {
            .value {
                color: theme.$sidemenu-menuitem-color;
            }
        }
    }

    ai-field {
        padding: 0 1.25em;
        margin-left: theme.$default-padding;
        margin-right: theme.$default-padding;
    }
}

.a-sidemenu .a-menu-section .a-menu-item > a > span {
    opacity: 1;
    transition: opacity 0.1s;
}

.a-sidemenu.is-collapsed .a-menu-section > .a-menu-header.minimizable > .label {
    color: transparent;
    background: theme.$sidemenu-section-header-bg-collapsed;
}

.a-sidemenu.is-collapsed
    .a-menu-section
    > .a-menu-header.minimizable
    ~ ul
    > .a-menu-item-group
    > .a-menu-item
    > a
    > span,
.a-sidemenu.is-collapsed
    .a-menu-section
    > .a-menu-header.minimizable
    ~ ul
    > .a-menu-item
    > a
    > span {
    opacity: 0;
}

@media screen and (min-width: 769px), print {
    .a-menu-section {
        min-width: 0;
    }
}
</style>
