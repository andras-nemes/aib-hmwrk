import type { Ref } from 'vue'
import { ref } from 'vue'
import type TextEditor from './TextEditor.vue'

interface UsesValueEditor {
    internalValue: Ref<EditableValue | null>
    originalValue: Ref<EditableValue | null>
    /** Handler when editor changes the value. */
    handleChange: (value: EditableValue) => void
}

export interface ValueEditorEmits {
    (e: 'change-preferred-size'): void
    (e: 'update:modelValue', value: EditableValue): void
}

export interface ValueEditorProps {
    modelValue?: EditableValue | null
    defaultValue?: EditableValue | null
    disabled?: boolean
    returnSubmits?: boolean
}

type EditableValue = string | boolean | number | Record<string, unknown>

export function useValueEditor(props: ValueEditorProps, emit: ValueEditorEmits): UsesValueEditor {
    /** Internal value that is currently being edited */
    const internalValue = ref<EditableValue | null>(null)
    /** Original value that the edit was started with. */
    const originalValue = ref<EditableValue | null>(null)

    function handleChange(value: EditableValue): void {
        internalValue.value = value
        emit('update:modelValue', value)
    }

    return {
        internalValue,
        originalValue,
        handleChange,
    }
}

export interface TemplateRefs {
    editor?: Ref<InstanceType<typeof TextEditor> | null>
    input?: Ref<HTMLInputElement | null>
    dropdown?: Ref<HTMLElement | null>
}
