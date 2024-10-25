<template>
    <BaseButton
        v-bind="props"
        class="a-primary-btn"
        :icon="icon || 'fas fa-check'"
        @click="handleClick"
    >
        <slot />
    </BaseButton>
</template>

<script lang="ts" setup>
/**
 * Button that is colored with Primary color.
 * This button is intended to be used whenever a regular button is needed in UI. Use this instead of Button, or extend Button to new component.
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
.a-button.is-primary,
.a-primary-btn {
    border: theme.$button-primary-border;
    background: theme.$button-primary-bg;
    color: theme.$button-primary-color;

    &:active,
    &.is-active {
        background: theme.$button-primary-bg-active;
        border-color: theme.$button-primary-border-color-active;
        color: theme.$button-primary-color-active;
    }

    &:hover,
    &.is-hovered {
        background: theme.$button-primary-bg-hover;
        border-color: theme.$button-primary-border-color-hover;
        color: theme.$button-primary-color-hover;
    }

    &:focus,
    &.is-focused {
        background: theme.$button-primary-bg-focus;
        border-color: theme.$button-primary-border-color-focus;
        color: theme.$button-primary-color-focus;
    }

    &.is-disabled,
    &[disabled='true'] {
        background: theme.$button-primary-bg-disabled;
        border-color: theme.$button-primary-border-color-disabled;
        color: theme.$button-primary-color-disabled;
    }

    &.is-outlined {
        background-color: transparent;
        border-color: theme.$button-primary-bg;
        color: theme.$button-primary-bg;

        &:hover,
        &.is-hovered,
        &:focus,
        &.is-focused {
            background-color: theme.$button-primary-bg;
            border-color: theme.$button-primary-bg-hover;
            color: theme.$button-primary-color-hover;
        }
    }

    &:focus:not(:active),
    &.is-focused:not(:active) {
        box-shadow: theme.$button-primary-box-shadow-focus;
    }
}
</style>
