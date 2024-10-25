<template>
    <a-logout></a-logout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Shared logout component, which logs out the user when entering the route.
 * Shows fullscreen information and blocks user to interact with page.
 */
export default defineComponent({
    name: 'LogoutView',
})
</script>
