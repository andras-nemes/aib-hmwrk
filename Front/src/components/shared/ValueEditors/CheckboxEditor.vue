<template>
    <component
        :is="`ai-field-editor`"
        ref="editor"
        class="checkbox"
        :class="{disabled: disabled}"
    >
        <slot name="before" />
        <input
            ref="input"
            v-model="internalValue"
            type="checkbox"
            tabindex="0"
            :disabled="disabled"
            autocomplete="ai-off"
        />
        <slot name="checkbox" />
        <slot name="label" />
        <slot name="after" />
    </component>
</template>

<script setup lang="ts">
/**
 * CheckboxEditor
 */
import { watch, onMounted } from 'vue'
import { useValueEditor, type ValueEditorProps } from './useValueEditor'
import type { ValueEditorEmits } from './useValueEditor'
import { useDebounce } from './useDebounce'

const props = withDefaults(defineProps<ValueEditorProps>(), {
    modelValue: false,
    disabled: false,
    returnSubmits: true,
    defaultValue: false,
})

const emit = defineEmits<ValueEditorEmits>()

const { internalValue, originalValue } = useValueEditor(props, emit)
useDebounce(emit)

onMounted(() => updateValue())

watch(
    () => props.modelValue,
    () => updateValue()
)

function updateValue(): void {
    internalValue.value = props.modelValue ?? props.defaultValue ?? false
    originalValue.value = internalValue.value
}
</script>
