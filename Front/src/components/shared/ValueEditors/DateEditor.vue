<template>
    <TextEditor
        ref="editor"
        v-click-away="handleClickAway"
        class="a-date-editor"
        :placeholder="placeholder"
        :show-counter="false"
        :model-value="internalTextEditorValue"
        :allow-new-lines="false"
        :arrow-keys-navigates="arrowKeysNavigates"
        single-row
        :disabled="disabled"
        :class="{'has-dropdown': isDropdownShown}"
        @click="showDropdown"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @change-preferred-size="handlePreferredSize"
        @update:model-value="handleTextChange"
        @submit="submit"
        @cancel="cancel"
    >
        <template #before>
            <slot name="before" />
        </template>
        <template #after>
            <div
                v-show="isDropdownShown"
                ref="dropdown"
                class="dropdown depth-12"
                @wheel.stop=""
                @click.stop=""
                @mouseup.stop=""
                @mousedown.stop=""
            >
                <div
                    ref="picker"
                />
            </div>
            <slot name="after" />
        </template>
    </TextEditor>
</template>

<script setup lang="ts">
/**
 * DateEditor
 */
import Pikaday from 'pikaday'
import { createPopper } from '@popperjs/core'
import type { Instance } from '@popperjs/core'
import { DateFormats, formatDateFrom } from 'lib/helpers/dates/formatDate'
import TextEditor from './TextEditor.vue'
import { parse, isValid } from 'date-fns'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useDebounce } from './useDebounce'
import { directive as vClickAway } from 'vue3-click-away'

interface Props {
    /** Override value type to be javascript Date object */
    modelValue?: Date | string | null
    placeholder?: string
    /** Set true to disable default left and right, and home and end keyboard behavior and instead use the keys to move to next or prev editor */
    arrowKeysNavigates?: boolean
    /** Value format for editor to parse string from or null if value is Date */
    valueFormat?: string | null
    /** Displaying format for editor */
    displayFormat?: DateFormats
    /** What is the minimum allowed date. Set null to allow any date */
    minDate?: Date | null
    /** What is the maximum allowed date. Set null to allow any date */
    maxDate?: Date | null
    /** What is the initial date when opening datepicker. Set null to set today */
    defaultValue?: Date | null
    /** Years range relative to selected year */
    yearRange?: number
    disabled?: boolean
    /** Flag to prevent datepicker submitting when picking date */
    submitAndClose?: boolean
    /** When focusing dropdown, show dropdown. Note clicking / typing on input always shows dropdown */
    openDropdownOnFocus?: boolean
    returnSubmits?: boolean
    /** If should trap focus inside the datepicker */
    trapFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    placeholder: '',
    arrowKeysNavigates: false,
    valueFormat: null,
    displayFormat: DateFormats.YearLastSpaced,
    minDate: null,
    maxDate: null,
    defaultValue: null,
    yearRange: 150,
    disabled: false,
    submitAndClose: true,
    openDropdownOnFocus: false,
    returnSubmits: true,
    trapFocus: true,
})

const emit = defineEmits([
    'focus',
    'blur',
    'keydown',
    'update:modelValue',
    'submit',
    'cancel',
    'change-preferred-size',
])

/** Override internal value type to be Date or string in case of invalid date input. */
const internalValue = ref<Date | string | null>(null)
/** Override original value type to be Date */
const originalValue = ref<Date | string | null>(null)
/** Popper to position the dropdown */
const popperInstance = ref<Instance | null>(null)
/** Pikaday DatePicker instance */
const pickerInstance = ref<Pikaday | null>(null)
/** Internal Text Editor value */
const internalTextEditorValue = ref<string>('')
/** True if dropdown is currently shown. */
const isDropdownShown = ref<boolean>(false)
/** Flag to prevent datepicker submitting when picking date */
const selectingDateSubmits = ref<boolean>(true)
/** Flag to check editor doesn't submit same value twice */
const hasSubmitted = ref<boolean>(false)

const editor = ref<InstanceType<typeof TextEditor> | null>(null)
const dropdown = ref<HTMLElement | null>(null)
const picker = ref<HTMLElement | null>(null)

/** Computed default date */
const computedDefaultDate = computed<Date>(() => props.defaultValue ?? new Date())

const { emitPreferredSize } = useDebounce(emit)

/** When external value changes, change the internal value to match */
watch(
    () => props.modelValue,
    (newValue: Date | string | null) => {
        if (typeof newValue === 'string') {
            const dateValue = parse(newValue, props.valueFormat || '', computedDefaultDate.value)
            if (isValid(dateValue)) {
                newValue = dateValue
            }
        }

        originalValue.value = newValue
        internalValue.value = newValue
        emitPreferredSize()
    }
)

/** When internal value changes, set the text editor to match the value */
watch(internalValue, (newValue: Date | string | null) => {
    internalTextEditorValue.value =
        typeof newValue === 'string'
            ? newValue
            : formatDateFrom(newValue, props.valueFormat || '', props.displayFormat) || ''

    emitPreferredSize()
})

onMounted(() => {
    internalValue.value = props.modelValue
    originalValue.value = internalValue.value
    internalTextEditorValue.value =
        formatDateFrom(internalValue.value, props.valueFormat || '', props.displayFormat) ||
        internalValue.value?.toString() ||
        ''
})

onBeforeUnmount(() => {
    if (pickerInstance.value) {
        pickerInstance.value.destroy()
    }
})

function getInputElement(): HTMLElement | null {
    return editor.value?.getInputElement() || null
}

async function recalculateSize(): Promise<void> {
    return editor.value?.recalculateSize()
}

/** Handler when TextEditor changes preferred size */
function handlePreferredSize(): void {
    emitPreferredSize()
}

async function updatePosition(): Promise<void> {
    return undefined
}

/** Show DatePicker */
async function showDropdown(): Promise<void> {
    if (isDropdownShown.value || !dropdown.value || !editor.value) {
        return
    }

    const trigger = editor.value.getInputElement()
    if (!trigger) {
        return
    }

    isDropdownShown.value = true

    popperInstance.value = createPopper(trigger, dropdown.value, {
        placement: 'bottom-start',
        strategy: 'fixed',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 2],
                },
            },
            {
                name: 'preventOverflow',
                options: {
                    altAxis: true,
                    padding: 4,
                },
            },
        ],
    })

    await nextTick()

    popperInstance.value?.update()

    if (picker.value) {
        const originalValueDate =
            originalValue.value instanceof Date
                ? originalValue.value
                : new Date(String(originalValue.value))

        const settings = {
            field: picker.value,
            bound: false,
            yearRange: props.yearRange,
            setDefaultDate: true, // Always allow to set default date
            defaultDate: props.defaultValue || originalValueDate || undefined,
            onSelect: (date: Date) => {
                if (!selectingDateSubmits.value) {
                    return
                }

                internalTextEditorValue.value =
                    formatDateFrom(date, props.valueFormat || '', props.displayFormat) || ''

                hasSubmitted.value = false

                if (props.submitAndClose) {
                    submit()
                    hideDropdown()
                    blur()
                }
            },
        }

        pickerInstance.value = new Pikaday(settings)
        pickerInstance.value.show()
    }
}

/** Hide DatePicker */
async function hideDropdown(): Promise<void> {
    if (popperInstance.value) {
        popperInstance.value.destroy()
    }

    if (pickerInstance.value) {
        pickerInstance.value.destroy()
    }

    isDropdownShown.value = false
}

async function focus(): Promise<void> {
    return editor.value?.focus()
}

/** Handler when text input receives focus */
function handleFocus(event: FocusEvent): void {
    if (props.openDropdownOnFocus) {
        showDropdown()
    }

    emit('focus', event)
}

/** Blur the Text editor */
async function blur(): Promise<void> {
    return editor.value?.blur()
}

/** Handler when text input loses focus */
function handleBlur(event: FocusEvent): void {
    emit('blur', event)
}

/** When input receives keydown */
function handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Tab') {
        submit()
    } else if (event.code !== 'Enter' && event.code !== 'Escape' && event.code !== 'NumpadEnter') {
        showDropdown()
    }

    emit('keydown', event)
}

/** Handler when user clicks away from the dropdown list */
function handleClickAway(): void {
    if (isDropdownShown.value) {
        submit()
    }
}

/** Handle value change from the TextEditor */
function handleTextChange(value: string | null): void {
    // Try parsing the date
    const parsedDate = parse(String(value), props.displayFormat, computedDefaultDate.value)
    if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        // Set the internal value here so that the picker onSelect does not submit
        selectingDateSubmits.value = false
        if (pickerInstance.value) {
            pickerInstance.value.setDate(parsedDate)
        }

        selectingDateSubmits.value = true
    } else {
        selectingDateSubmits.value = false
        if (pickerInstance.value) {
            pickerInstance.value.setDate(null)
        }

        selectingDateSubmits.value = true
    }

    internalTextEditorValue.value = String(value)
    hasSubmitted.value = false

    const emitValue = props.valueFormat
        ? formatDateFrom(parsedDate, '', props.valueFormat)
        : parsedDate

    emit('update:modelValue', emitValue)
}

/** Submit value. */
function submit(): void {
    if (hasSubmitted.value) {
        hideDropdown()
        return
    }

    const parsedDate = parse(
        internalTextEditorValue.value,
        props.displayFormat,
        computedDefaultDate.value
    )

    const isValidDate = isValid(parsedDate)

    // Update internal value to match
    if (!internalTextEditorValue.value.length) {
        internalValue.value = null
    } else if (isValidDate) {
        internalValue.value = parsedDate
    } else {
        internalValue.value = internalTextEditorValue.value
    }

    const emitValue =
        props.valueFormat && isValidDate
            ? formatDateFrom(internalValue.value, '', props.valueFormat)
            : internalValue.value

    emit('update:modelValue', emitValue)
    emit('submit', emitValue)

    hasSubmitted.value = true

    blur()
    hideDropdown()
}

/** Cancel value edit. */
function cancel(): void {
    internalValue.value = originalValue.value

    const emitValue = props.valueFormat
        ? formatDateFrom(internalValue.value, '', props.valueFormat)
        : internalValue.value

    emit('update:modelValue', emitValue)
    emit('cancel', emitValue)
    hasSubmitted.value = true

    internalTextEditorValue.value =
        formatDateFrom(internalValue.value, props.valueFormat || '', props.displayFormat) || ''

    blur()
    hideDropdown()
}

defineExpose({
    recalculateSize,
    getInputElement,
    updatePosition,
    focus,
    blur,
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

// Override Pikaday date editor styles (uses Pikaday library)
.a-date-editor {
    > .dropdown {
        display: flex;
        flex-shrink: 1;
        background-color: theme.$white;
        overflow: auto;
        z-index: 1200;
    }

    .pika-label {
        padding: 0.5em;
        position: relative;
        padding-right: 2em;

        &:after {
            position: absolute;
            display: block;
            content: ' ';

            border: 1px solid theme.$table-cell-dropdown-arrow-color;
            border-right: 0;
            border-top: 0;

            transform: rotate(-45deg);
            transform-origin: center;
            height: 0.5em;
            width: 0.5em;
            margin-top: -4px;
            right: 9px;
            top: 17px;
        }
        &:hover {
            background-color: theme.$dropdown-item-bg-hover;
            border-radius: 3px;
        }
    }

    .pika-button {
        background-color: theme.$default-bg-color;

        &:hover {
            background-color: theme.$dropdown-item-bg-hover;
            color: theme.$default-text-color;
        }
    }

    .is-today {
        .pika-button {
            color: theme.$dropdown-item-empty-color;
            background-color: theme.$dropdown-item-highlight-bg;
        }
    }

    .is-selected {
        .pika-button {
            background: theme.$dropdown-item-selected-bg;
            color: theme.$dropdown-item-selected-color;
            box-shadow: none;
        }
    }
}
</style>
