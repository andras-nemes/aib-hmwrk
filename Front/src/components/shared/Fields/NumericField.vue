<template>
    <FieldLayout
        v-bind="fieldProps"
        class="numeric-field"
    >
        <NumericEditor
            ref="editor"
            :model-value="String(internalValue)"
            :class="{'has-icon': hasIcon}"
            single-row
            blur-submits
            :min="minValue"
            :max="maxValue"
            :step="stepValue"
            :placeholder="computedField.placeholder"
            :show-counter="false"
            :allow-new-lines="false"
            :disabled="isDisabled"
            @submit="handleChange"
            @blur="handleBlur"
            @focus="handleFocus"
        >
            <template
                v-if="hasIcon"
                #before
            >
                <span class="icon is-left">
                    <slot name="icon">
                        <i :class="computedField.icon" />
                    </slot>
                </span>
            </template>

            <template
                v-if="isClearable && !isDisabled"
                #after
            >
                <span
                    class="icon clear only-focus is-clickable"
                    title="Clear value"
                    @click="clearValue"
                >
                    <i class="fas fa-times" />
                </span>
                <slot name="after" />
            </template>
            <template
                v-else
                #after
            >
                <slot name="after" />
            </template>
        </NumericEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { ref, computed, watch, onMounted } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits, FieldValue } from './useField'
import NumericEditor from 'components/shared/ValueEditors/NumericEditor.vue'

interface Props extends FieldProps {
    /** Override value to match this field requirements */
    modelValue: number | string | null
    /** Minimum value */
    min?: number | null
    /** Maximum value */
    max?: number | null
    /** Step value */
    step?: number | null
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    min: null,
    max: null,
    step: null,
})

const emit = defineEmits<Emits>()

const {
    hasIcon,
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    isClearable,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
    handleBlur,
    handleFocus,
    handleInput,
    clearValue,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

const editor = ref<InstanceType<typeof NumericEditor> | null>(null)

/** Minimum value from computedField */
const minValue = computed<number | undefined>(() => {
    if (typeof computedField.value?.minValue === 'number') {
        return computedField.value.minValue
    }

    return undefined
})

/** Maximum value from computedField */
const maxValue = computed<number | undefined>(() => {
    if (typeof computedField.value?.maxValue === 'number') {
        return computedField.value.maxValue
    }

    return undefined
})

/** Step value from computedField */
const stepValue = computed<number | undefined>(() => {
    if (typeof computedField.value?.stepValue === 'number') {
        return computedField.value.stepValue
    }

    return undefined
})

/** When the value prop changes, set the internal state and run the validation pipeline */
watch(
    () => props.modelValue,
    async newVal => {
        originalValue.value = newVal
        internalValue.value = newVal
        await validate()
    }
)

/** When the validators object is reassigned, run the validation pipeline */
watch(allValidators, async () => await validate())
/** When the number of validators change, run the validation pipeline */
watch(validatorCount, async () => await validate())

onMounted(async () => {
    originalValue.value = props.modelValue || null
    internalValue.value = props.modelValue || null
    await validate()
})

/** Handler when the input submits changes */
function handleChange(value: FieldValue | null): void {
    if (props.disabled) {
        return
    }

    if (value === '') {
        value = null
    } else if (typeof value !== 'number') {
        const numericValue = parseFloat(value as string)
        if (!Number.isNaN(numericValue)) {
            value = numericValue
        }

        if (internalValue.value === value) {
            return
        }
    }

    internalValue.value = value
    handleInput(value)
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

ai-field.numeric-field {
    ai-field-editor {
        display: inline-flex;
        align-items: baseline;
        justify-content: center;
        box-sizing: border-box;

        clear: both;
        position: relative;
        text-align: left;
        max-width: 200px;
        vertical-align: top;

        background: theme.$control-bg;
        color: theme.$control-color;
        box-shadow: theme.$control-box-shadow;
        border: theme.$control-border;
        border-radius: theme.$control-border-radius;

        > input {
            display: block;
            border-radius: theme.$control-border-radius;
            padding: 0;
            padding-bottom: calc(0.375em - 1px);
            padding-left: calc(0.625em - 1px);
            padding-right: calc(0.625em - 1px);
            padding-top: calc(0.375em - 1px);
            flex-grow: 1;
            font-size: 1em;
            max-width: 100%;
            outline: none;

            &.disabled,
            &[disabled] {
                background-color: theme.$control-bg-disabled;
                border-color: theme.$control-border-color-disabled;
                color: theme.$control-color-disabled;
                opacity: 0.6;
                cursor: not-allowed;
            }
        }

        &.has-icon {
            > input {
                padding-left: 2rem;
            }
        }

        > .icon.is-left {
            display: inline-flex;
            position: absolute;
            align-items: center;
            justify-content: center;
            left: calc(0.625em - 1px);
            top: 1px;
            bottom: 0;
            color: theme.$control-icon-color;
            pointer-events: none;
            width: 1.5em;
            z-index: 4;
            flex-shrink: 0;
        }

        > .icon.clear {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: calc(0.625em - 1px);
            top: 1px;
            bottom: 0;
            color: theme.$control-icon-color;
            cursor: pointer;
            width: 1.5em;
            z-index: 4;
            flex-shrink: 0;
        }

        &:hover::after {
            border-color: #363636;
        }

        &:hover {
            border-color: theme.$control-border-color-hover;
            > .icon.is-left {
                color: theme.$control-icon-color-hover;
            }
        }

        &:focus-within {
            border-color: theme.$control-border-color-focus;
            box-shadow: theme.$control-box-shadow-focus;
        }

        &:hover,
        &:focus-within {
            > .icon.clear {
                color: theme.$control-icon-color-hover;
            }
        }
    }

    &.invalid {
        ai-field-editor {
            border-color: theme.$control-border-color-invalid;

            &:focus-within {
                box-shadow: theme.$control-box-shadow-invalid-focus;
            }
        }
    }
}
</style>
