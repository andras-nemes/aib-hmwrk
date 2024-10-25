<template>
    <BaseButton
        v-bind="props"
        class="a-delete-btn"
        :title="title || $t('components.actions.delete.title')"
        :icon="icon || 'fa fa-trash'"
        @click="handleClick"
    >
        <slot />
    </BaseButton>
</template>

<script lang="ts" setup>
/**
 * Button that is colored with Danger color.
 * This button looks like the action is about to delete something.
 * Use 'data-content' attribute, if you want a fancy hover text animation.
 */
import BaseButton from './BaseButton.vue'
import type { Props, Emits } from './useButton'
import { defaultProps, useButton } from './useButton'

const props = withDefaults(defineProps<Props>(), defaultProps)
const emit = defineEmits<Emits>()
const { handleClick } = useButton(props, emit)
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

.a-button.is-danger,
.a-delete-btn {
    border: theme.$button-danger-border;
    background: theme.$button-danger-bg;
    color: theme.$button-danger-color;

    &:active,
    &.is-active {
        background: theme.$button-danger-bg-active;
        border-color: theme.$button-danger-border-color-active;
        color: theme.$button-danger-color-active;
    }

    &:hover,
    &.is-hovered {
        background: theme.$button-danger-bg-hover;
        border-color: theme.$button-danger-border-color-hover;
        color: theme.$button-danger-color-hover;
    }

    &:focus,
    &.is-focused {
        background: theme.$button-danger-bg-focus;
        border-color: theme.$button-danger-border-color-focus;
        color: theme.$button-danger-color-focus;
    }

    &.is-disabled,
    &[disabled='true'] {
        background: theme.$button-danger-bg-disabled;
        border-color: theme.$button-danger-border-color-disabled;
        color: theme.$button-danger-color-disabled;
    }

    &.is-outlined {
        background-color: theme.$button-outlined-danger-bg;
        border: theme.$button-outlined-danger-border;
        color: theme.$button-outlined-danger-color;

        &:hover,
        &.is-hovered {
            background-color: theme.$button-outlined-danger-bg-hover;
            border: theme.$button-outlined-danger-border;
            color: theme.$button-outlined-danger-color;
        }
    }

    &:focus:not(:active),
    &.is-focused:not(:active) {
        box-shadow: theme.$button-danger-box-shadow-focus;
    }
}
</style>
