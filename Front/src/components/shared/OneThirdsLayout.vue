<template>
    <PaneLayout
        grid
        content-grow
        content-separation
        class="one-thirds-layout"
        :class="{hasthird: $slots.third}"
    >
        <template #content>
            <slot name="first" />
            <slot name="second" />
            <slot name="third" />
            <slot />
            <slot name="overlay" />
        </template>
    </PaneLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PaneLayout from './PaneLayout.vue'

/**
 * This layout is used where the view should be divided to two, with first slot going to left side of the screen,
 * as some sort of side-panel, and second, third and default slots optionally splitting the next column evenly.
 *
 * Additional slot to use overlay within the whole layout.
 */
export default defineComponent({
    name: 'OneThirdsLayout',
    components: {
        PaneLayout,
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/mixins';

ai-pane.is-grid {
    &.one-thirds-layout {
        display: grid;

        // There are two columns. One that can grow up to 415px and second who will fill the rest
        grid-template-columns: minmax(min-content, 415px) auto;
        grid-template-rows: 1fr min-content;

        &.hasthird {
            grid-template-rows: auto auto min-content;
        }

        > :first-child {
            grid-row: 1 / span 3;
        }

        > ai-overlay {
            margin: 0.375rem;
        }

        @include mixins.smallerThanTablet {
            grid-template-columns: auto;
            grid-template-rows: min-content;
            > .flex-grow-1 {
                min-height: 100vh;
            }
        }
    }
}
</style>
