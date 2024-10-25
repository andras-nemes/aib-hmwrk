<template>
    <FieldLayout
        v-bind="fieldProps"
        class="richtext-field"
        :title="undefined"
    >
        <RichTextEditor
            v-click-away="handleClickAway"
            :model-value="internalValue ? String(internalValue) : undefined"
            :can-open-in-modal="canOpenInModal"
            :label="String(fieldProps?.label)"
            blur-submits
            :placeholder="computedField.placeholder"
            show-counter
            allow-new-lines
            :disabled="isDisabled"
            :can-insert-image="computedInsertImage || canInsertImage"
            :can-insert-table="computedInsertTable || canInsertTable"
            :table-styles="computedTableStyles ||tableStyles"
            :max-length="computedField.maxLength"
            :is-field-focused="isFieldFocused"
            @click="handleClick"
            @submit="handleChange"
            @blur="handleBlur"
            @focus="handleFocus"
        >
        </RichTextEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { ref, computed, watch, onMounted } from 'vue'
import RichTextEditor from 'components/shared/ValueEditors/RichTextEditor.vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'
import type { TableStyles } from '../ValueEditors/richTextTableConstants'
import { defaultRichTextTableStyles } from '../ValueEditors/richTextTableConstants'

interface Props extends FieldProps {
    /** True, if the rich text editor can be opened in a new modal window */
    canOpenInModal?: boolean
    /** True if can insert image, passed from rich text modal */
    canInsertImage?: boolean
    /** True if can insert a table */
    canInsertTable: boolean
    /** Table styles */
    tableStyles: TableStyles
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    canOpenInModal: true,
    canInsertImage: false,
    canInsertTable: false,
    tableStyles: () => defaultRichTextTableStyles,
})

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

/** True, if user is still clicking inside the editor area. False if user click outside the editor area. */
const isFieldFocused = ref<boolean>(false)

const computedInsertImage = computed(() => computedField.value?.canHaveImages)
const computedInsertTable = computed(() => computedField.value?.canHaveTables)
const computedTableStyles = computed(() => computedField.value?.tableStyles)

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

/** Handle when user clicks inside the field to add input */
function handleClick(): void {
    isFieldFocused.value = true
}

/** Handle when user clicks outside of the field to submit input */
function handleClickAway(): void {
    isFieldFocused.value = false
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
ai-field.richtext-field {
    overflow: hidden;
    .rich-text-editor {
        box-shadow: theme.$control-box-shadow;
        border: theme.$control-border;
        border-radius: theme.$control-border-radius;

        &:hover {
            border-color: theme.$control-border-color-hover;

            .menubar {
                .expand {
                    display: block;
                }
            }
        }

        &:focus-within {
            border-color: theme.$control-border-color-focus;
            box-shadow: theme.$control-box-shadow-focus;
        }

        header {
            border-bottom: theme.$control-border;
        }

        .menubar {
            margin: 0.5em;
            position: relative;

            .expand {
                position: absolute;
                top: 0;
                right: 0;
                z-index: 100;
            }

            button {
                margin-right: calc(0.625em - 1px);
            }
        }

        .rich-text-content {
            overflow: auto;

            .ProseMirror {
                // Limit the minimum and maximum size that RichTextEditor can grow inside a field
                min-height: 10rem;
                max-height: 20rem;
            }

            background: theme.$control-bg;
            color: theme.$control-color;
            font-size: 0.75rem;
            padding: calc(0.375em - 1px) calc(0.625em - 1px);

            &[disabled='true'] {
                background-color: theme.$control-bg-disabled;
                border-color: theme.$control-border-color-disabled;
                color: theme.$control-color-disabled;
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
    }
}
</style>
