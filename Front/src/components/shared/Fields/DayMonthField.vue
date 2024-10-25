<template>
    <FieldLayout
        v-bind="fieldProps"
        class="daymonth-field"
    >
        <SelectField
            :model-value="internalValueAsDate?.day"
            :items="days"
            key-property="value"
            label-property="label"
            placeholder="DD"
            :disabled="isDisabled"
            no-label-element
            data-cy="day-picker"
            @update:model-value="handleDayChange"
            @blur="handleBlur"
            @focus="handleFocus"
        >
        </SelectField>
        <span class="daymonth-separator">/</span>
        <SelectField
            :model-value="internalValueAsDate?.month"
            :items="months"
            key-property="value"
            label-property="label"
            placeholder="MM"
            :disabled="isDisabled"
            data-cy="month-picker"
            no-label-element
            @update:model-value="handleMonthChange"
            @blur="handleBlur"
        >
        </SelectField>
    </FieldLayout>
</template>

<script setup lang="ts">
import { getDaysInMonth, format } from 'date-fns'
import { range } from 'lib/helpers'
import { FieldLayout } from 'components/shared/Form'
import type { DateObject, DropdownItem } from './types'
import { computed, watch, onMounted } from 'vue'
import SelectField from './SelectField.vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits, FieldValue } from './useField'

interface Props extends FieldProps {
    /** Override value to match this field requirements */
    modelValue?: DateObject | null
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    modelValue: null,
})

const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    isDisabled,
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

/** Internal value for this daymonth field */
const internalValueAsDate = computed<DateObject | null>(
    () => internalValue.value as DateObject | null
)

/** All available options for days for autocomplete list. */
const days = computed<DropdownItem[]>(() => {
    const date = new Date(
        internalValueAsDate.value?.year || new Date().getFullYear(),
        (internalValueAsDate.value?.month || 1) - 1,
        1
    )

    const dayInts = range(1, getDaysInMonth(date))

    return dayInts.map(num => {
        return {
            value: num,
            label: `${100 + num}`.substring(1),
        }
    })
})

/** All available options for months for autocomplete list. */
const months = computed<DropdownItem[]>(() => {
    const monthInts = range(1, 12)

    return monthInts.map(num => {
        const year = internalValueAsDate.value?.year || new Date().getFullYear()
        const month = format(new Date(year, (num || 1) - 1, 1), 'MMMM')
        return {
            value: num,
            label: month,
        }
    })
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

/** Handler when the day changes */
function handleDayChange(value: FieldValue | null): void {
    if (props.disabled || internalValueAsDate.value?.day == value) {
        return
    }

    if (internalValueAsDate.value) {
        internalValueAsDate.value.day = value === null ? undefined : Number(value)
    }

    handleInput(internalValue.value)
}

/** Handler when the month changes */
function handleMonthChange(value: FieldValue | null): void {
    if (props.disabled || internalValueAsDate.value?.month == value) {
        return
    }

    if (internalValueAsDate.value) {
        internalValueAsDate.value.month = value === null ? undefined : Number(value)
    }

    handleInput(internalValue.value)
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
ai-field.daymonth-field {
    .daymonth-separator {
        font-size: 2em;
        line-height: calc(0.5 * #{theme.$control-height});
        padding-top: 0.125rem;
        padding-right: 0.325rem;
        padding-left: 0.325rem;
    }
}
</style>
