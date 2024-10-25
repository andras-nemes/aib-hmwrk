<template>
    <FieldLayout
        v-bind="fieldProps"
        class="date-field"
    >
        <DateEditor
            :class="{ 'has-icon': hasIcon }"
            single-row
            :placeholder="computedField.placeholder"
            :show-counter="false"
            :allow-new-lines="false"
            :disabled="isDisabled"
            :model-value="validatedInternalValue"
            :display-format="displayFormat"
            :value-format="valueFormat"
            :min-date="computedMinDate"
            :max-date="computedMaxDate"
            :default-value="computedDefaultValue"
            @submit="handleChange"
            @cancel="handleChange"
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
        </DateEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { DateFormats } from 'lib/helpers/dates/formatDate'
import { FieldLayout } from 'components/shared/Form'
import { computed, watch, onMounted } from 'vue'
import DateEditor from 'components/shared/ValueEditors/DateEditor.vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'

interface Props extends FieldProps {
    modelValue?: Date | string | null
    /** Displaying format for text input */
    displayFormat?: DateFormats
    /** Value format for field to parse date string */
    valueFormat?: DateFormats
    /** Min value for the date */
    minDate?: Date | null
    /** Max value for the date */
    maxDate?: Date | null
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    modelValue: null,
    displayFormat: DateFormats.YearLastSpaced,
    valueFormat: DateFormats.YearFirstDashed,
    minDate: null,
    maxDate: null,
})

const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    isClearable,
    hasIcon,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
    handleBlur,
    handleFocus,
    handleChange,
    clearValue,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

/** Earliest date that can be selected */
const computedMinDate = computed<Date | undefined>(() => {
    if (props.field?.minDate instanceof Date) {
        return props.field.minDate
    }

    if (props.minDate) {
        return props.minDate
    }

    return undefined
})

/** Latest date that can be selected */
const computedMaxDate = computed<Date | undefined>(() => {
    if (props.field?.maxDate instanceof Date) {
        return props.field.maxDate
    }

    if (props.maxDate) {
        return props.maxDate
    }

    return undefined
})

/** The default date from where to open the data picker */
const computedDefaultValue = computed<Date | undefined>(() => {
    if (props.field?.defaultValue instanceof Date) {
        return props.field.defaultValue
    }

    return undefined
})

const validatedInternalValue = computed<string | Date | null>(() => {
    if (internalValue.value === null) {
        return null
    }

    if (!(internalValue.value instanceof Date)) {
        return String(internalValue.value)
    }

    return internalValue.value
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
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

ai-field.date-field {
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

        color: theme.$control-color;
        background: theme.$control-bg;
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
