<template>
    <a-notification>
        <template #title>
            <MarkdownLayout :source="$t('components.layout.notification.delete-items.title', {count: count > 0 ? count : '', itemType: type})">
            </MarkdownLayout>
        </template>
        <template #info>
            {{ text }}
        </template>
    </a-notification>
</template>

<script lang="ts">
/**
 * Template to use when deleting multiple items from table.
 */
import Notification from './Notification.vue'
import MarkdownLayout from 'components/shared/Markdown/MarkdownLayout.vue'
import type { DeletedItem } from './DeleteItemsNotification'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
    components: {
        'a-notification': Notification,
        MarkdownLayout,
    },

    extends: Notification,

    props: {
        /** Datatype from which the items are removed from. */
        type: {
            type: String,
            default: 'DataType',
        },

        /** Array of items which are being removed. */
        items: {
            type: Array as PropType<DeletedItem<number | string>[]>,
            default: () => {
                return []
            },
        },
    },

    computed: {
        /** Compute length of items array */
        count(): number {
            if (!this.items) {
                return 0
            }

            return this.items.length
        },
    },
})
</script>
