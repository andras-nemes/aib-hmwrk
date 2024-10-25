<template>
    <router-view>
        <template #pagetabs>
            <slot name="pagetabs" />
        </template>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * This view acts only as router-view.
 */
export default defineComponent({})
</script>

