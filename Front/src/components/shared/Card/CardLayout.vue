<template>
    <PaneLayout
        :depth="depth"    
        :has-loader="hasLoader"
        card
        rounded
        :grow="grow"
        :shrink="shrink"
        :scrollable="scrollable"
        :rows="rows"
        :columns="columns"
        :wrap-items="wrapItems"
        :align-items="alignItems"
        :justify-content="justifyContent"
        :content-padding="contentPadding === undefined || contentPadding === null ? true : contentPadding"
        :content-grow="contentGrow"
        :content-separation="contentSeparation"
        :background="background || 'white'"
        :loading="loading"
    >
        <template #tabs>
            <slot name="tabs" />
        </template>
        <template #header>
            <slot name="header" />
        </template>
        <template #default>
            <slot name="default" />
        </template>
        <template #content>
            <slot name="content" />
        </template>
        <template #footer>
            <slot name="footer" />
        </template>
        <template #loader>
            <slot name="loader" />
        </template>
        <template #overlay>
            <slot name="overlay" />
        </template>
    </PaneLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PaneLayout from '../PaneLayout.vue'
import type { Props } from '../PaneLayout.vue'

export default defineComponent({
    name: 'OneThirdsLayout',

    components: {
        PaneLayout,
    },
    props: {
        hasLoader: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        scrollable: {
            type: Boolean,
            default: false,
        },
        rows: {
            type: Boolean,
            default: false,
        },
        columns: {
            type: Boolean,
            default: false,
        },
        grid: {
            type: Boolean,
            default: false,
        },
        card: {
            type: Boolean,
            default: false,
        },
        bordered: {
            type: Boolean,
            default: false,
        },
        rounded: {
            type: Boolean,
            default: false,
        },
        depth: {
            type: Number,
            default: 0,
        },
        grow: {
            type: Number,
            default: 1,
        },
        shrink: {
            type: Number,
            default: null,
        },
        background: {
            type: String,
            default: null,
        },
        contentPadding: {
            type: Boolean,
            default: null,
        },
        contentSeparation: {
            type: undefined,
            default: undefined,
        },
        contentGrow: {
            type: Boolean,
            default: false,
        },
        wrapItems: {
            type: Boolean,
            default: false,
        },
        debug: {
            type: Boolean,
            default: false,
        },
        justifyContent: {
            type: String,
            default: null,
        },
        alignItems: {
            type: String,
            default: null,
        },
    },
})
</script>
