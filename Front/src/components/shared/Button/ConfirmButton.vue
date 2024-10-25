<template>
    <BaseButton
        v-bind="props"
        class="a-confirm-btn"
        :title="title || $t('components.actions.confirm.title')"
        :icon="icon || 'fa fa-check'"
        @click="handleClick"
    >
        <slot />
    </BaseButton>
</template>

<script lang="ts" setup>
/**
 * Button that is colored with Success color (greenish).
 * This button looks like the action is about to finalize or confirm user action.
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
.a-button.is-success,
.a-confirm-btn {
    border: theme.$button-success-border;
    background: theme.$button-success-bg;
    color: theme.$button-success-color;

    &:active,
    &.is-active {
        background: theme.$button-success-bg-active;
        border-color: theme.$button-success-border-color-active;
        color: theme.$button-success-color-active;
    }

    &:hover,
    &.is-hovered {
        background: theme.$button-success-bg-hover;
        border-color: theme.$button-success-border-color-hover;
        color: theme.$button-success-color-hover;
    }

    &:focus,
    &.is-focused {
        background: theme.$button-success-bg-focus;
        border-color: theme.$button-success-border-color-focus;
        color: theme.$button-success-color-focus;
    }

    &.is-disabled,
    &[disabled='true'] {
        background: theme.$button-success-bg-disabled;
        border-color: theme.$button-success-border-color-disabled;
        color: theme.$button-success-color-disabled;
    }

    &.is-outlined {
        background-color: transparent;
        border-color: theme.$button-success-bg;
        color: theme.$button-success-bg;

        &:hover,
        &.is-hovered,
        &:focus,
        &.is-focused {
            background-color: theme.$button-success-bg;
            border-color: theme.$button-success-bg-hover;
            color: theme.$button-success-color-hover;
        }
    }

    &:focus:not(:active),
    &.is-focused:not(:active) {
        box-shadow: theme.$button-success-box-shadow-focus;
    }

    &.is-loading::after {
        border-color: transparent transparent theme.$button-success-loading-color
            theme.$button-success-loading-color !important;
    }
}
</style>
