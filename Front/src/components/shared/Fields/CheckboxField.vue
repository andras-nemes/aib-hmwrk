<template>
    <FieldLayout
        v-bind="fieldProps"
        class="checkbox-field"
    >
        <CheckboxEditor
            :model-value="checkboxValue"
            :class="{ 'has-icon': hasIcon, [computedField.color || 'no-color']: true }"
            :disabled="isDisabled"
            :default-value="Boolean(computedDefaultValue)"
            @blur="handleBlur"
            @focus="handleFocus"
        >
            <template
                v-if="hasIcon"
                #before
            >
                <slot name="before" />
                <span class="icon is-left">
                    <slot name="icon">
                        <i :class="computedField.icon" />
                    </slot>
                </span>
            </template>
            <template #checkbox>
                <span
                    class="check is-success"
                    @click.stop="handleChange(!checkboxValue)"
                />
            </template>
            <template #label>
                <span
                    v-if="hasTitle"
                    class="control-label"
                    @click.stop="handleChange(!checkboxValue)"
                >
                    <slot name="default">{{ computedField.title }}</slot>
                </span>
            </template>
        </CheckboxEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { computed, watch, onMounted } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits, FieldValue } from './useField'
import CheckboxEditor from 'components/shared/ValueEditors/CheckboxEditor.vue'

interface Props extends FieldProps {
    defaultValue?: FieldValue
    /** Instead of boolean "True", emit this value as the true value */
    trueValue?: FieldValue
    /** Instead of boolean "False", emit this value as the true value */
    falseValue?: FieldValue
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    modelValue: false,
    defaultValue: false,
    trueValue: true,
    falseValue: false,
})

const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    hasIcon,
    hasTitle,
    computedDefaultValue,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
    handleBlur,
    handleFocus,
    handleInput,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

/** Checked value for the checkbox. Defaults to true */
const computedTrueValue = computed<FieldValue | null>(() => {
    // Field value always overrides
    if (typeof computedField.value?.trueValue !== 'undefined') {
        return computedField.value.trueValue
    }

    return props.trueValue || false
})

/** Unchecked value for the checkbox. Defaults to false */
const computedFalseValue = computed<FieldValue | null>(() => {
    // Field value always overrides
    if (typeof computedField.value?.falseValue !== 'undefined') {
        return computedField.value.falseValue
    }

    return props.falseValue || false
})

/** Convert value to boolean */
const checkboxValue = computed(() => internalValue.value === computedTrueValue.value)

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

/** Handler when the checkbox changes */
async function handleChange(value: FieldValue | null): Promise<void> {
    if (props.disabled || internalValue.value === value) {
        return
    }

    const emitValue = value === true ? computedTrueValue.value : computedFalseValue.value
    internalValue.value = emitValue
    handleInput(emitValue)
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

ai-field-editor.checkbox {
    display: inline-flex;
    vertical-align: top;
    justify-content: center;
    align-items: center;
    height: theme.$control-height;
    position: relative;

    text-align: left;
    max-width: 100%;
    outline: none;
    user-select: none;

    color: theme.$default-text-color;

    > input[type='checkbox'] {
        position: absolute;
        left: 0;
        opacity: 0;
        outline: none;
        z-index: -1;
    }

    > span.check {
        width: 1.5em;
        height: 1.5em;
        flex-shrink: 0;
        border-radius: theme.$control-border-radius;
        background: theme.$control-bg;
        border: theme.$control-border;
        cursor: pointer;
    }

    > span.control-label {
        padding-left: 0.5em;
        cursor: pointer;
    }

    input[type='checkbox']:checked + span.check {
        background: theme.$primary
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:white' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E")
            no-repeat center center;
        background-size: 14px 14px;
        border-color: theme.$primary;
    }

    &.disabled,
    &[disabled='true'] {
        cursor: not-allowed;
        opacity: 0.5;

        > * {
            pointer-events: none;
        }
    }

    &.disabled > span.check,
    &[disabled='true'] > span.check {
        background: theme.$control-bg-disabled;
        border-color: theme.$control-border-color-disabled;
    }

    &.has-icon {
        padding-left: 2rem;
    }

    > .icon.is-left {
        display: inline-flex;
        position: absolute;
        align-items: center;
        justify-content: center;
        left: calc(0.625em - 1px);
        top: 0px;
        bottom: 0;
        color: theme.$control-icon-color;
        pointer-events: none;
        width: 1.5em;
        z-index: 4;
        flex-shrink: 0;
    }
}

ai-field.checkbox-field {
    ai-field-editor.checkbox {
        input[type='checkbox']:checked + span.check {
            background: theme.$primary
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:white' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E")
                no-repeat center center;
            border-color: theme.$primary;
            background-size: 14px 14px;
        }

        input[type='checkbox']:focus + .check {
            box-shadow: theme.$button-primary-box-shadow-focus;
        }

        &:hover {
            > input[type='checkbox']:not(:disabled) + .check {
                border-color: theme.$primary;
            }

            > input[type='checkbox']:not(:disabled):checked + .check {
                background-color: theme.$primary;
            }

            > .icon.is-left {
                //color: theme.$control-icon-color-hover;
            }
        }
    }
}
</style>
