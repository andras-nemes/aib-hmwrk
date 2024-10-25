<template>
    <PaneLayout
        :columns="columns"
        :rows="rows || !columns"
        content-grow
        content-separation
    >
        <template #content>
            <TopPaper v-if="$slots.filters">
                <template #items>
                    <PaneLayout
                        v-if="$slots.filters"
                        columns
                        content-separation
                    >
                        <slot name="filters" />
                    </PaneLayout>
                    <PaneLayout
                        v-else
                        columns
                        content-separation
                    >
                    </PaneLayout>
                </template>
            </TopPaper>

            <slot />

            <slot
                v-if="$slots.modals"
                name="modals"
            />

            <slot name="loader">
                <LoadingIndicator :active="loading"></LoadingIndicator>
            </slot>
        </template>
    </PaneLayout>
</template>

<script lang="ts" setup>
/**
 * Default Page layout to display any page content.
 */
import PaneLayout from './PaneLayout.vue'
import TopPaper from './TopPaper.vue'
import LoadingIndicator from './Loader/LoadingIndicator.vue'

export interface Props {
    /** If the default page layout should be rows */
    rows?: boolean
    /** If the default page layout should be columns */
    columns?: boolean
    /** If we are loading this layout */
    loading?: boolean
}

withDefaults(defineProps<Props>(), {
    rows: true,
    columns: false,
    loading: false,
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';

.root-page-layout > ai-rows > ai-card {
    @include mixins.smallerThanTablet {
        &.flex-grow-1 {
            min-height: calc(100vh - 64px - #{theme.$default-content-padding} * 2);
        }
    }
}
</style>
