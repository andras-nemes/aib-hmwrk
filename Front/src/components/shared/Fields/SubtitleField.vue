<template>
    <FieldLayout
        v-bind="fieldProps"
        class="subtitle-field"
    >
        <template #label>
            <label>
                {{ computedLabel }}
            </label>
        </template>
        <template #value>
            <div class="value" />
        </template>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { watch, onMounted } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'

const props = withDefaults(defineProps<FieldProps>(), defaultFieldProps)
const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedLabel,
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
</script>
