<template>
    <FieldLayout
        v-bind="fieldProps"
        class="textarea-field-layout"
    >
        <TextEditor
            :model-value="internalValue ? String(internalValue) : undefined"
            class="a-control"
            blur-submits
            :placeholder="computedField.placeholder"
            :show-counter="true"
            :allow-new-lines="true"
            :disabled="isDisabled"
            :resizeable="true"
            :max-length="computedField.maxLength"
            @submit="handleChange"
            @blur="handleBlur"
            @focus="handleFocus"
        >
        </TextEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import TextEditor from 'components/shared/ValueEditors/TextEditor.vue'
import { watch, onMounted } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'

const props = withDefaults(defineProps<FieldProps>(), defaultFieldProps)
const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
    handleBlur,
    handleFocus,
    handleChange,
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

<style lang="scss">
@use '~@/assets/sass/theme';

ai-field.textarea-field-layout {
    ai-field-editor {
        display: block;
        position: relative;
        box-sizing: border-box;
        clear: both;
        text-align: left;

        textarea {
            background: theme.$control-bg;
            color: theme.$control-color;
            box-shadow: theme.$control-box-shadow;
            border: theme.$control-border;
            border-radius: theme.$control-border-radius;
            font-size: 0.75rem;
            padding: 0;
            padding-bottom: calc(0.375em - 1px);
            padding-left: calc(0.625em - 1px);
            padding-right: calc(0.625em - 1px);
            padding-top: calc(0.375em - 1px);
            max-width: 100%;
            min-width: 100%;

            min-height: 120px;
            max-height: 450px;

            &[disabled] {
                background-color: theme.$control-bg-disabled;
                border-color: theme.$control-border-color-disabled;
                color: theme.$control-color-disabled;
                opacity: 0.6;
                cursor: not-allowed;
            }
        }

        textarea:hover {
            border-color: theme.$control-border-color-hover;
        }

        textarea:focus {
            border-color: theme.$control-border-color-focus;
            box-shadow: theme.$control-box-shadow-focus;
        }
    }
}
</style>
