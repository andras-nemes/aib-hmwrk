<template>
    <component
        :is="`ai-field-editor`"
        ref="editor"
        class="a-text-editor"
        :class="{disabled: disabled, resizeable: resizeable}"
    >
        <slot name="before" />
        <input
            ref="input"
            v-model="internalValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :type="inputType"
            :min="min"
            :max="max"
            :step="step"
            tabindex="0"
            autocomplete="ai-off"
            @click="handleClick"
            @mousedown="event => stopMousedown && event.stopPropagation()"
            @keydown="handleKeyboardEvent"
            @cut="handleCopyPaste"
            @paste="handleCopyPaste"
            @drop="emitDelayedPreferredSize"
            @focus="handleFocus"
            @blur="handleBlur"
            @compositionstart="emitDelayedPreferredSize"
            @compositionupdate="emitDelayedPreferredSize"
            @compositionend="emitDelayedPreferredSize"
        />
        <slot name="after" />
    </component>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TextEditorProps, TextEditorEmits } from './useTextEditor'
import { textEditorDefaults, useTextEditor } from './useTextEditor'
import type TextEditor from './TextEditor.vue'

const props = withDefaults(defineProps<TextEditorProps>(), {
    ...textEditorDefaults,
    showCounter: false,
    singleRow: true,
    allowNewLines: false,
    numeric: true,
})

const emit = defineEmits<TextEditorEmits>()

const editor = ref<InstanceType<typeof TextEditor> | null>(null)
const input = ref<HTMLInputElement | null>(null)

const {
    internalValue,
    inputType,
    getInputElement,
    recalculateSize,
    focus,
    blur,
    handleFocus,
    handleBlur,
    handleClick,
    handleKeyboardEvent,
    handleCopyPaste,
    updatePosition,
    emitDelayedPreferredSize,
} = useTextEditor(props, emit, { editor, input })

defineExpose({
    recalculateSize,
    updatePosition,
    getInputElement,
    focus,
    blur,
})
</script>

<style lang="scss" src="./text-editor.scss"></style>
