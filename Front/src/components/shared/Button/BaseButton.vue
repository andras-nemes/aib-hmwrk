<template>
    <button
        :disabled="disabled"
        class="a-button"
        :class="buttonClass"
        :title="title"
        @click="handleClick"
    >
        <span
            v-if="(icon || iconComponent) && iconAlign === 'left'"
            class="icon"
        >
            <i
                v-if="icon"
                :class="icon"
            />
            <component
                :is="iconComponent"
                v-else
            >
            </component>
        </span>

        <slot />

        <span
            v-if="(icon || iconComponent) && iconAlign === 'right'"
            class="icon"
        >
            <i
                v-if="icon"
                :class="icon"
            />
            <component
                :is="iconComponent"
                v-else
            >
            </component>
        </span>
    </button>
</template>

<script lang="ts" setup>
/**
 * Simple button. Use this instead of HTML5 <button>.
 */
import { computed } from 'vue'
import { defaultProps, useButton } from './useButton'
import type { Props, Emits } from './useButton'

interface ButtonClasses {
    /** Is button outlined */
    'is-outlined'?: boolean
    /** Is button load */
    'is-loading'?: boolean
    /** Is button align left */
    left?: boolean
    /** Is button align right */
    right?: boolean
}

const props = withDefaults(defineProps<Props>(), defaultProps)
const emit = defineEmits<Emits>()
const { handleClick } = useButton(props, emit)

/** Compute button class based on props */
const buttonClass = computed<ButtonClasses>(() => ({
    'is-outlined': props.outlined,
    'is-loading': props.loading,
    left: props.iconAlign === 'left',
    right: props.iconAlign === 'right',
}))
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';

.a-button {
    display: inline-flex;
    position: relative;
    vertical-align: top;
    justify-content: center;
    align-items: baseline;
    height: theme.$control-height;

    border: theme.$button-default-border;
    background: theme.$button-default-bg;
    color: theme.$button-default-color;
    box-shadow: theme.$shadow-xs;

    cursor: pointer;

    line-height: 2em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    padding: 0 20px 0 20px;
    min-width: 0;

    &:active,
    &.is-active {
        background: theme.$button-default-bg-active;
        border-color: theme.$button-default-border-color-active;
        color: theme.$button-default-color-active;
    }

    &:hover,
    &.is-hovered {
        background: theme.$button-default-bg-hover;
        border-color: theme.$button-default-border-color-hover;
        color: theme.$button-default-color-hover;
    }

    &:focus,
    &.is-focused {
        background: theme.$button-default-bg-focus;
        border-color: theme.$button-default-border-color-focus;
        color: theme.$button-default-color-focus;
        outline: none;
    }

    &:focus:not(:active),
    &.is-focused:not(:active) {
        box-shadow: theme.$button-default-box-shadow-focus;
    }

    &.is-disabled,
    &[disabled] {
        background: theme.$button-default-bg-disabled;
        border-color: theme.$button-default-border-color-disabled;
        color: theme.$button-default-color-disabled;
        box-shadow: none;
        opacity: 0.5;
        cursor: not-allowed;
    }

    &.is-outlined {
        background-color: transparent;
        border-color: theme.$button-default-bg;
        color: theme.$button-default-bg;

        &:hover,
        &.is-hovered,
        &:focus,
        &.is-focused {
            background-color: theme.$button-default-bg;
            border-color: theme.$button-default-bg-hover;
            color: theme.$button-default-color-hover;
        }
    }

    & {
        border-radius: theme.$button-border-radius;
        font-size: theme.$default-font-size;
        font-weight: 700;
    }

    > .icon {
        display: inline-flex;
        user-select: none;
        cursor: inherit;
        align-items: center;
        justify-content: center;
        align-self: center;
        width: 1.5em;

        &:first-child:last-child {
            margin-left: calc(-0.375em - 1px);
            margin-right: calc(-0.375em - 1px);
        }

        &:last-child:not(:first-child) {
            margin-left: 0.1875em;
            margin-right: calc(-0.375em - 1px);
        }

        &:first-child:not(:last-child) {
            margin-left: calc(-0.375em - 1px);
            margin-right: 0.1875em;
        }
    }

    > span:not(.icon) {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        pointer-events: none;
    }

    > .mobile-only {
        display: none;
    }

    &.is-loading {
        color: transparent !important;
        pointer-events: none;

        &::after {
            position: absolute;
            left: calc(50% - (1em / 2));
            top: calc(50% - (1em / 2));
            position: absolute !important;
        }

        &::after {
            position: relative;
            display: block;
            animation: spinAround 500ms infinite linear;
            border: 2px solid theme.$button-default-loading-color;
            border-radius: 290486px;
            border-right-color: transparent;
            border-top-color: transparent;
            content: '';
            height: 1em;
            width: 1em;
        }
    }

    @include mixins.smallerThanSmallDesktop {
        padding: 0 5px 0 5px;
        > .text {
            display: none;
        }

        > .mobile-only {
            display: inline;
        }

        .icon {
            width: 2.5em;
            &:first-child:last-child {
                margin-left: initial;
                margin-right: initial;
            }

            &:last-child:not(:first-child) {
                margin-left: initial;
                margin-right: initial;
            }

            &:first-child:not(:last-child) {
                margin-left: initial;
                margin-right: initial;
            }
        }
    }
}
</style>
