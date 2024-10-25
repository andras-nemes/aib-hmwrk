<template>
    <FieldLayout
        v-bind="fieldProps"
        class="label-field"
    >
        <slot>
            <p v-if="typeof modelValue === 'boolean'">
                <i
                    :class="{ 'fas fa-check': modelValue, 'fas fa-times': !modelValue }"
                />
            </p>
            <p v-else-if="typeof modelValue === 'number'">
                {{ displayNumber(modelValue) }}
            </p>
            
            <p 
                v-else-if="modelValue"
                :title="displayTextValue(String(modelValue))"
            >
                {{ displayTextValue(String(modelValue)) }}
            </p>
            <p v-else>
                &ndash;
            </p>
        </slot>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'
import { watch, onMounted } from 'vue'
import { formatHTMLbeforeRender } from 'layout/lib/helpers'
import { displayNumber as displayNumberHelper } from 'lib/helpers'

const props = withDefaults(defineProps<FieldProps>(), defaultFieldProps)
const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

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

/** Helper to render a text value. Converts rich-text content to plain text. */
function displayTextValue(value: string): string {
    const regex = /<article>(.*?)<\/article>/gi
    if (!regex.test(value)) {
        return value
    }

    return formatHTMLbeforeRender(value)
}

/** Helper to convert number to display string uses roundNumber decimals */
function displayNumber(value: number): string {
    if (computedField.value?.format === false) {
        return value?.toString() || ''
    }

    const decimals = props.roundNumber !== null ? props.roundNumber : undefined
    return displayNumberHelper(value, decimals) || ''
}
</script>
