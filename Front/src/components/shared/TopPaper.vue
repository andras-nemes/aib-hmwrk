<template>
    <a-card
        class="top-paper"
        :grow="0"
    >
        <template #content>
            <a-pane
                rows
                content-padding
            >
                <a-pane
                    v-if="$slots.info"
                    rows
                    wrap-items
                    content-separation
                >
                    <slot name="info" />
                </a-pane>

                <a-pane
                    v-if="$slots.items"
                    columns
                    wrap-items
                    align-items="flex-end"
                >
                    <slot name="items" />
                </a-pane>
            </a-pane>
        </template>
    </a-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Component to display page instructions and optional counter on paper header.
 */
export default defineComponent({})
</script>
