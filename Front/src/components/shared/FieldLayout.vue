<template>
    <ai-field>
        <slot
            v-if="!noLabelElement"
            name="label"
        >
            <label>
                <span v-if="label">{{ label }}</span>
                <span v-else>&nbsp;</span>
                <i
                    v-if="labelIcon"
                    class="label-icon"
                    :class="{[labelIcon]: true, 'has-callback': labelIconCallback !== null}"
                    @click="handleLabelIconClick" 
                />
                <span v-if="labelIcon">&nbsp;</span>
                <span
                    v-if="isRequired"
                    class="required"
                    :title="$t('errors.validation.is-required')"
                > * </span>
                <i
                    v-if="!isValid"
                    class="invalid-icon fas fa-exclamation-circle"
                    :title="messages.join('\n')"
                />
            </label>
        </slot>
        <slot name="value">
            <div class="value">
                <slot />
            </div>
        </slot>
        <slot name="message">
            <div 
                v-if="(messages && messages.length) || helperComponent"
                class="help"
            >
                <div
                    v-if="messages && messages.length"
                    class="error-message"
                >
                    <template v-for="(message, i) in messages">
                        {{ message }}
                        <br
                            v-if="(i + 1) < messages.length"
                            :key="i"
                        />
                    </template>
                </div>
                <component 
                    :is="helperComponent"
                    v-if="helperComponent"
                    v-bind="helperProps"
                    class="helper-component"
                >
                </component>
            </div>
        </slot>
    </ai-field>
</template>

<script setup lang="ts">
/**
 * Component to wrap field editors around with the necessary dom elements for dynamic layout to layout properly
 */
import type { Component } from 'vue'

interface Props {
    /** Set true to remove label element completely. Note that setting this to true might result into invalid layout on dynamic form editors */
    noLabelElement?: boolean
    /** String to show as label of the field */
    label?: string | null
    /** FontAwesome icon to show icon before label string */
    labelIcon?: string | null
    labelIconCallback?: (...args: unknown[]) => unknown | null
    /** True if this field is required. Shows "required" -asterisk (*) after the label */
    isRequired?: boolean
    /** True if this field is valid. False if the field is not valid, and then an error info icon is shown after the label */
    isValid?: boolean
    /** Optional messages to show after the field editors. If isValid = false, messages shown as with danger color */
    messages?: string[]
    /** Optional helper component to show on the lower right of the field. */
    helperComponent?: Component | null
    /** Optional props for helper component. */
    helperProps?: Record<string, unknown> | null
}

const props = withDefaults(defineProps<Props>(), {
    noLabelElement: false,
    label: null,
    labelIcon: null,
    labelIconCallback: () => null,
    isRequired: false,
    isValid: true,
    messages: () => [],
    helperComponent: null,
    helperProps: null,
})

function handleLabelIconClick(event: Event): void {
    if (typeof props.labelIconCallback === 'function') {
        props.labelIconCallback(event)
    }
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
ai-field-group {
    display: inline-flex;
    flex-wrap: wrap;
}

ai-field-editor:focus {
    outline: none;
}

ai-field {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.25em;

    > label {
        color: theme.$default-text-color;
        font-weight: 700;
        text-align: left;

        .label-icon {
            margin-left: 0.325em;
            color: theme.$table-cell-icon-color;

            &.has-callback {
                cursor: pointer;

                &:hover {
                    color: theme.$table-cell-hovered-icon-color;
                }
            }
        }
    }

    > label:not(:last-child) {
        margin-bottom: 0;
    }

    &.no-label {
        > label::after {
            content: '\00a0';
        }
    }

    > .value {
        display: flex;
        flex-direction: row;

        > p {
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
        }

        > ai-field-editor > input:not([type='checkbox']) {
            width: 100%;
            height: theme.$control-height;
            background: transparent;
            color: theme.$control-color;
        }
    }

    > .help {
        display: grid;
        grid-auto-flow: column;

        .error-message {
            display: block;
            font-size: 0.75rem;
            overflow: hidden;
        }

        .helper-component {
            overflow: hidden;
        }
    }

    &.invalid {
        .invalid-icon,
        > .help .error-message {
            color: theme.$danger;
        }

        span + .invalid-icon {
            margin-left: 0.325em;
        }
    }

    &.form-field {
        padding: 0.325em;
    }
}
</style>
