<template>
    <div class="top-bar">
        <div class="title">
            <div
                class="logo-container"
                @click="$emit('logo-clicked')"
            >
                <MarkLogo>
                </MarkLogo>
            </div>
            <div class="separator" />
            <span class="name">{{ solutionName }}</span>
        </div>
        <div class="main-area">
            <div class="selectors">
                <slot name="selectors" />
            </div>
            <div class="menus">
                <slot name="menus" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import MarkLogo from './MarkLogo.vue'

interface Props {
    /** The name of the solution displayed in the title section. */
    solutionName: string
}

withDefaults(defineProps<Props>(), { solutionName: '' })
defineEmits<{
    (event: 'logo-clicked'): void
}>()
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';

.top-bar {
    display: flex;
    height: theme.$topbar-height;
    font-size: theme.$default-font-size;
    background: theme.$topbar-bg;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 1003;

    /** Margin and width adjustments very temporary to support optional TopBar while showing mobile sidemenu.*/
    margin-left: 60px;
    width: calc(100vw - 60px);

    > .title {
        display: flex;
        width: theme.$sidemenu-width;
        align-items: center;

        > .logo-container {
            cursor: pointer;
            min-width: theme.$sidemenu-width-collapsed;
            height: theme.$topbar-height;
            display: flex;
            align-items: center;
            justify-content: center;
            > #AibidiaLogoMark {
                height: theme.$topbar-height;
                fill: theme.$black;
            }
        }

        > .separator {
            height: 30px;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        > .name {
            padding: theme.$default-padding;
            font-size: 22px;
            font-weight: 700;
            width: 0; // Temporary until better mobile layout
        }
    }

    > .main-area {
        display: flex;
        justify-content: right;
        flex-grow: 1;
        padding: 1em;
        > .selectors,
        > .menus {
            display: flex;
            gap: 10px;
            align-items: center;
            margin: 5px;
        }
    }

    @include mixins.largerThanTablet {
        margin-left: 0;
        width: 100vw;
        > .main-area {
            justify-content: space-between;
        }
    }
}
</style>
