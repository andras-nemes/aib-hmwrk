<template>
    <PaneLayout
        class="root-page-layout"
        rows
        :scrollable="false"
        content-grow
        content-padding
        content-separation
    >
        <Tabs
            v-if="$slots.pagetabs"
            class="is-fullwidth"
        >
            <slot name="pagetabs" />
        </Tabs>

        <slot name="page">
            <router-view>
            </router-view>
        </slot>
    </PaneLayout>
</template>

<script lang="ts" setup>
/**
 * Root page layout which are used in category pages.
 */
import PaneLayout from './PaneLayout.vue'
import Tabs from './Tabs/Tabs.vue'
</script>
