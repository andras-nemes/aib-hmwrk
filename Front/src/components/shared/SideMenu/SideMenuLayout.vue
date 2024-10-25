<template>
    <div
        class="a-sidemenu"
        :class="menuClass"
        @mouseover="event => $emit('mouseover', event)"
        @mouseleave="event => $emit('mouseleave', event)"
    >
        <div class="a-sidemenu-content-wrapper">
            <header>
                <div
                    v-if="showStickyIcon"
                    class="sticky-icon"
                    :title="stickyIconTitle"
                >
                    <i
                        :class="stickyIconClass"
                        data-cy="menu-sticky-thumbtack"
                        @click="$emit('stickyclick')"
                    />
                </div>
                <slot name="menuButton" />

                <div class="logo-slot-wrapper">
                    <slot name="logo" />
                </div>
            </header>
            <div
                class="a-content"
                @scroll="handleContentScroll"
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

enum MenuPositions {
    Left,
    Right,
}

// Dynamic class object of component
interface ComponentClass {
    [className: string]: boolean
}

// Dynamic class object of component
interface MenuItem {
    recalculatePosition: () => void
}

/**
 * This component is responsible for the layout of side menus.
 * Menu style changes according to stickiness, collapsing and menu position.
 * Stickiness = Do not collapse menu on mouse leave.
 * Collapse = Minimize to icons (SolutionMenu) or disappear (PlatformMenu).
 * Menu position = Which side of the screen the menu should be on.
 * SolutionMenu is on the left.
 * PlatformMenu is on the right.
 */
export default defineComponent({
    props: {
        /** Control whether menu is open in mobile */
        open: {
            type: Boolean,
            default: false,
        },
        /** Control whether menu is collapsed in non-mobile layout */
        collapsed: {
            type: Boolean,
            default: false,
        },
        /** Control whether menu should collapse on mouse leave */
        sticky: {
            type: Boolean,
            default: false,
        },
        /** Show sticky icon in menu (only on uncollapsed state) */
        showStickyIcon: {
            type: Boolean,
            default: true,
        },
        /** Control position of menu in non-mobile layout */
        menuPosition: {
            type: Number as () => MenuPositions,
            default: MenuPositions.Left,
        },
    },

    emits: ['mouseover', 'mouseleave', 'stickyclick'],

    computed: {
        /** Classes for sticky icon */
        stickyIconClass(): ComponentClass {
            return {
                'fas fa-thumbtack': true,
                'fa-thumbtack--active': !this.sticky,
            }
        },

        /** Title for sticky icon depending of stickiness */
        stickyIconTitle(): string {
            if (this.sticky) {
                return 'Always show side menu'
            }

            return 'Show side menu only on mouse over'
        },

        /** Dynamic classes for menu element */
        menuClass(): ComponentClass {
            return {
                'is-open': this.open,
                'is-closed': !this.open,
                'is-collapsed': this.collapsed,
                'is-sticky': this.sticky,
                'is-not-sticky': !this.sticky,
                'is-left': this.menuPosition === MenuPositions.Left,
                'is-right': this.menuPosition === MenuPositions.Right,
            }
        },
    },

    methods: {
        /**
         * On hover + scroll, the dom does not receive mouseover events.
         * Reposition submenus manually.
         */
        handleContentScroll(): void {
            // Iterate all elements in slots
            const elements = this.$slots.default
            if (!elements) {
                return
            }

            for (const i in elements) {
                const el = elements[i]
                // If element is Vue component instance
                if (el && el.componentInstance) {
                    const inst = el.componentInstance as MenuItem
                    // If element supports recalculatePosition call
                    if (typeof inst.recalculatePosition === 'function') {
                        inst.recalculatePosition()
                    }
                }
            }
        },
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';

.a-sidemenu {
    position: fixed;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    z-index: 1002;
    transition:
        width 0.1s ease-in,
        height 0.1s ease-in;

    top: 0;
    width: 100%;
    // Account for top bar bottom border by adding pixels.
    // 0.9 instead of 1 to avoid a tiny bit of the menu from appearing under the top bar when zooming.
    height: calc(theme.$topbar-height + 0.9px);

    flex-shrink: 0;
    flex-grow: 0;
    margin: 0;
    padding: 0;

    // .a-sidemenu-content-wrapper is a workaround needed to fix bug in Safari: https://bugs.webkit.org/show_bug.cgi?id=160953
    .a-sidemenu-content-wrapper {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;

        > .a-content {
            padding-top: 1em;
        }

        > header {
            position: relative;
            display: flex;
            justify-content: flex-start;
            align-items: start;
            flex-grow: 0;
            flex-shrink: 0;
            min-width: 0;
            color: theme.$grey;

            .logo-slot-wrapper {
                position: absolute;
                left: 50%;
                top: 0;
                transform: translateX(-50%);
            }

            > .a-breadcrumbs {
                margin-left: 1em;
            }

            > .sticky-icon {
                color: theme.$sidemenu-sticky-icon-color;
                bottom: 0;
                right: 10px;
                position: absolute;
                cursor: pointer;
                transition: opacity 0.1s;
                opacity: 0.8;
                font-size: 1rem;

                .fa-thumbtack--active {
                    transform: rotate(90deg);
                    padding-right: 5px;
                }

                &:hover {
                    opacity: 1;
                }
            }
        }
    }

    .is-not-sticky {
        z-index: 1001;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: theme.$sidemenu-background;
        background-size: cover;
        filter: theme.$sidemenu-background-filter;
    }

    &.is-left {
        left: 0;
        border-right: 1px solid theme.$default-border-color;
        &::before {
            background-position: left;
        }
    }
    &.is-right {
        right: 0;
        border-left: 1px solid theme.$default-border-color;
        &::before {
            background-position: right;
        }
        > header {
            padding: 0 120px 0 120px;
            margin: theme.$default-padding 0 theme.$default-padding 0;
        }
    }

    &.is-open {
        height: 100vh;
        > .a-content {
            overflow: auto;
            padding-bottom: 5em;
        }
    }

    .a-menu-toggle {
        position: relative;
        right: 0;
        width: theme.$sidemenu-width-collapsed;
        height: theme.$sidemenu-width-collapsed;
        cursor: pointer;
        background-color: transparent;
        border: 0;
        padding: 0;
        margin: 0 0 0 auto;
    }

    .a-menu-toggle > span:nth-child(1) {
        transform: translateY(-5px) rotate(0deg);
    }

    .a-menu-toggle > span:nth-child(2) {
        transform: scale(1) rotate(0deg);
    }

    .a-menu-toggle > span:nth-child(3) {
        transform: translateY(5px) rotate(0deg);
    }

    .a-menu-toggle > span {
        width: 17px;
        height: 2px;
        background-color: theme.$black;
        display: block;
        position: absolute;
        right: 22px;
        top: 50%;
        border-radius: 2px;
        transition:
            background 0.35s linear,
            transform 0.25s cubic-bezier(0.4, 0.01, 0.165, 0.99);
    }

    .a-menu-toggle.is-open > span:nth-child(1) {
        transform: translateY(0) rotate(45deg);
    }

    .a-menu-toggle.is-open > span:nth-child(2) {
        transform: scale(0) rotate(45deg);
    }

    .a-menu-toggle.is-open > span:nth-child(3) {
        transform: translateY(0) rotate(-45deg);
    }

    .a-menu-toggle.is-open > span {
        transition:
            background 0.35s linear,
            transform 0.25s cubic-bezier(0.4, 0.01, 0.165, 0.99);
    }
}

@include mixins.smallerThanTablet {
    .a-sidemenu {
        .a-sidemenu-content-wrapper {
            > header {
                height: theme.$topbar-height;
                align-items: center;

                .logo {
                    height: theme.$topbar-height;
                }
            }
        }

        &.is-right {
            display: none;
        }
    }

    .a-sidemenu .sticky-icon {
        display: none;
    }
}

@include mixins.largerThanTablet {
    .a-sidemenu {
        width: theme.$sidemenu-width;
        height: 100%;

        .a-sidemenu-content-wrapper {
            > header {
                min-height: theme.$sidemenu-logo-section-height;
                height: theme.$sidemenu-logo-section-height;
                padding: theme.$default-padding;

                .a-menu-toggle {
                    display: none;
                }

                .mobile {
                    display: none;
                }
            }

            > .a-content {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                overflow-x: hidden;
                overflow-y: auto;
                width: calc(#{theme.$sidemenu-width});
                transition: width 0.2s;
                padding-top: initial;
                padding-bottom: 1rem;
                margin-top: 12px;
                min-width: 0;
            }
        }

        &.is-collapsed {
            transition: width 0.3s ease-out;

            &::before {
                transition: filter 0.3s ease-out;
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: theme.$sidemenu-background;
                background-size: cover;
            }

            &.is-left {
                width: #{theme.$sidemenu-width-collapsed};
                &::before {
                    background-position: left;
                }
            }

            &.is-right {
                &:not(:focus-within) {
                    width: 0px;
                }

                &::before {
                    background-position: right;
                }
            }

            header > .sticky-icon {
                opacity: 0;
            }
        }
    }

    .a-sidemenu .sticky-icon {
        display: flex;
    }
}
</style>
