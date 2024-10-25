<template>
    <component
        :is="`ai-field-editor`"
        ref="editor"
        class="a-text-editor"
        :class="{disabled: disabled, resizeable: resizeable}"
    >
        <slot name="before" />
        <textarea
            v-if="!singleRow"
            ref="input"
            :value="internalValue === null ? '' : internalValue"
            :placeholder="placeholder"
            :rows="numRows"
            :disabled="disabled"
            tabindex="0"
            autocomplete="ai-off"
            @input="internalValue = ($event.target as HTMLInputElement).value"
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
        <input
            v-else
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
        <span
            v-if="showCounter"
            class="counter"
            :class="{'limitReached': maxValueReached}"
            :style="counterPosition"
        >
            <span :title="counterTitle">{{ characterCount }}<template v-if="maxLength > 0">/{{ maxLength }}</template></span>
        </span>
        <slot name="after" />
    </component>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TextEditorProps, TextEditorEmits } from './useTextEditor'
import { textEditorDefaults, useTextEditor } from './useTextEditor'

const props = withDefaults(defineProps<TextEditorProps>(), textEditorDefaults)

const emit = defineEmits<TextEditorEmits>()
const input = ref<HTMLInputElement | null>(null)

const {
    internalValue,
    maxValueReached,
    numRows,
    characterCount,
    counterTitle,
    counterPosition,
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
} = useTextEditor(props, emit, { input })

defineExpose({
    recalculateSize,
    updatePosition,
    getInputElement,
    focus,
    blur,
})
</script>

<style lang="scss" src="./text-editor.scss"></style>