<template>
    <FieldLayout
        v-bind="fieldProps"
        class="action-field"
    >
        <BaseButton
            :class="computedField.color"
            :icon="computedField.icon"
            :disabled="isDisabled"
            :loading="isLoading"
            @click="handleAction"
            @blur="handleBlur"
            @focus="handleFocus"
        >
            <span>{{ computedField.title || 'Action' }}</span>
        </BaseButton>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { watch, onMounted } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'
import BaseButton from '../Button/BaseButton.vue'

const props = withDefaults(defineProps<FieldProps>(), defaultFieldProps)
const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    isLoading,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
    handleBlur,
    handleFocus,
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

/** Handles button click by calling field action callback */
async function handleAction(event: Event): Promise<void> {
    if (props.disabled) {
        return
    }

    if (!computedField.value || !props.parentObject) {
        return
    }

    if (typeof computedField.value?.action === 'function') {
        computedField.value.action(event, props.parentObject, null)
    }
}
</script>

<style lang="scss">
ai-field.action-field {
    .value {
        display: inline-flex;
        align-items: baseline;
        justify-content: flex-start;
        box-sizing: border-box;

        clear: both;
        position: relative;
        text-align: left;
        max-width: 100%;
        vertical-align: top;
        user-select: none;

        > button {
            flex-grow: 0;
        }
    }
}
</style>
