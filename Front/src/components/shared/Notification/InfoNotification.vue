<template>
    <a-notification>
        <template #title>
            {{ title }}
        </template>
        <template #info>
            {{ text }}
        </template>
    </a-notification>
</template>

<script lang="ts">
/**
 * Template to use when showing basic info notification.
 */
import Notification from './Notification.vue'
import { defineComponent } from 'vue'
export default defineComponent({
    components: {
        'a-notification': Notification,
    },

    extends: Notification,

    props: {
        /** Title of the notification. */
        title: {
            type: String,
            default: 'Information Notification',
        },
    },
})
</script>
