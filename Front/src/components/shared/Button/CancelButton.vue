<template>
    <BaseButton
        v-bind="props"
        class="a-cancel-btn"
        :title="title || $t('components.actions.cancel.title')"
        :icon="icon || 'fas fa-times'"
        @click="handleClick"
    >
        <slot />
    </BaseButton>
</template>

<script lang="ts" setup>
/**
 * Button that is colored with Cancel color and by default X icon.
 * This button looks like the proposed action is about to be cancelled, or cancels the active user flow.
 * Use this button to close modals, or cancel long running operations.
 */
import BaseButton from './BaseButton.vue'
import type { Props, Emits } from './useButton'
import { useButton, defaultProps } from './useButton'

const props = withDefaults(defineProps<Props>(), defaultProps)
const emit = defineEmits<Emits>()
const { handleClick } = useButton(props, emit)
</script>
