<template>
    <ai-tabs>
        <ai-tablist>
            <slot />
        </ai-tablist>
    </ai-tabs>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Component to show tabs as UL-list from links array. On analytics tabs, there is additional refresh icon to reloads the page data.
 */
export default defineComponent({})
</script>

<style lang="scss">
@use '~@/assets/sass/mixins';

ai-tabs {
    -webkit-overflow-scrolling: touch;
    display: block;
    overflow: hidden;
    user-select: none;

    &.separate {
        padding: 0.375rem;
    }

    > ai-tablist {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
        justify-content: flex-start;
        flex-wrap: wrap;
        min-width: 0;
    }

    &.is-fullwidth .a-tab {
        flex-shrink: 1;
        margin: 2px 0;
        &.is-active,
        &:hover {
            flex-shrink: 0;
        }
    }
}
</style>
