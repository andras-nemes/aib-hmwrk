<template>
    <main
        class="main"
        data-color-mode="light"
    >
        <slot name="app-loader" />
        <slot name="top-bar" />
        <slot name="menu" />
        <Pane
            class="main-layout"
            :class="{'menu--collapsed' : menuCollapsed}"
        >
            <template #theheader>
                <slot
                    name="notifications" 
                />
                <Pane
                    class="page-header"
                    columns
                    :grow="0"
                >
                    <BreadcrumbBlock>
                    </BreadcrumbBlock>
                    <Pane
                        class="page-controls"
                        columns
                        :grow="0"
                        content-separation
                    >
                        <slot name="header-slot" />
                    </Pane>
                </Pane>
            </template>
            <template #content>
                <router-view></router-view>
                <slot
                    name="after-content"
                />
            </template>
        </Pane>
        <slot
            v-if="$slots.modals"
            name="modals"
        />
        <slot
            v-if="$slots.tooltip"
            name="tooltip"
        />
    </main>
</template>

<script lang="ts">
import BreadcrumbBlock from '../Breadcrumb/BreadcrumbBlock.vue'
import Pane from '../PaneLayout.vue'
import { defineComponent } from 'vue'

/**
 * This is main application layout component. Splitting the app to menu and main content, displaying breadcrumb.
 * It also allows to collect all permanently created modals to cleanly after div to prevent z-indexing issues.
 */
export default defineComponent({
    components: {
        BreadcrumbBlock,
        Pane,
    },

    props: {
        /**
         * Is menu collapsed?
         * If true,
         *      option positions the menu over the content,
         * else
         *      move the content right, so that it is not under the menu.
         */
        menuCollapsed: {
            type: Boolean,
            default: false,
        },
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';
@use '~@/assets/sass/table';

body {
    font-size: 1em;
    line-height: 1.5;
    width: 100vw;
    height: 100vh;
}

body,
button,
input,
select,
textarea {
    font-family: theme.$default-font-family;
}

main {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    font-size: theme.$default-font-size;
    background: theme.$default-bg-color-darker;
    color: theme.$default-text-color;

    > .main-layout {
        flex-grow: 1;
        padding: 0;
        overflow: auto;

        > .page-header {
            display: flex;
            align-items: center;
            padding: theme.$default-padding theme.$default-padding 0 theme.$default-padding;
            margin: 0 calc(theme.$default-padding * 0.5);
            > .page-controls {
                > .page-control {
                    display: flex;
                    align-items: center;
                    > .user-logo {
                        > .icon {
                            color: theme.$page-control-user-logo-color;
                        }
                    }
                }
            }
        }
    }

    @include mixins.largerThanTablet {
        > .main-layout {
            margin-left: theme.$sidemenu-width;
            padding: 0;
        }
    }

    @include mixins.largerThanTablet {
        > .menu--collapsed {
            &.menu {
                width: theme.$sidemenu-width-collapsed !important;
                transition: width 0.3s ease-out;
            }

            &.main-layout {
                margin-left: theme.$sidemenu-width-collapsed !important;
            }
        }
    }

    @include mixins.smallerThanTablet {
        nav.breadcrumb {
            display: none;
        }

        > .main-layout > .page-header .a-breadcrumbs {
            padding-top: 0;

            > * {
                justify-content: center;
            }
        }

        > .main-layout {
            padding: 0;
        }
    }
}

// Scrollbar
/* width */
::-webkit-scrollbar {
    width: theme.$scrollbar-width;
    height: theme.$scrollbar-height;
}

/* Track */
::-webkit-scrollbar-track {
    background: theme.$scrollbar-track-color;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: theme.$scrollbar-thumb-color;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: theme.$scrollbar-thumb-color-hover;
}

/* Firefox Scrollbar colors */
* {
    scrollbar-width: thin;
    scrollbar-color: theme.$scrollbar-thumb-color theme.$scrollbar-track-color;
}
</style>
