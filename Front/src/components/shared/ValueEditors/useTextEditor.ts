// We observe TextArea size in order to position possible counter to BottomRight corner.
import ResizeObserver from 'resize-observer-polyfill'
import type { ComputedRef, Ref, StyleValue } from 'vue'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useDebounce } from './useDebounce'
import type { TemplateRefs } from './useValueEditor'

function setCaretPosition(element: HTMLInputElement, pos: number, endPos?: number): void {
    if (endPos === undefined) {
        endPos = pos
    }

    if (element.setSelectionRange) {
        element.focus()

        try {
            element.setSelectionRange(pos, endPos)
        } catch (err) {
            const elementParent = element.parentNode as HTMLElement
            const parentDisplayValue = elementParent.style.display
            elementParent.style.display = 'block'
            element.setSelectionRange(pos, endPos)
            elementParent.style.display = parentDisplayValue
        }
    }
}

/**
 * Returns caret position in text input
 *
 * @author http://stackoverflow.com/questions/263743/how-to-get-caret-position-in-textarea
 */
function getCaretPosition(el: HTMLInputElement): number {
    return el.selectionStart || 0
}

export interface TextEditorProps {
    modelValue: string | number | null
    /** Placeholder to show in the editor when no value (or empty string) is given. */
    placeholder?: string
    /** Set true to show character count on lower right corner of the TextArea element */
    showCounter?: boolean
    /** Maximum number of characters the data value can have. Longer texts will be clipped to this length. */
    maxLength?: number
    /** Set true to disable default up and down keyboard behaviour and instead use the keys to select items from possible child-editor. */
    updownSelects?: boolean
    /** Set true to disable default left and right, and home and end keyboard behaviour and instead use the keys to move to next or prev editor */
    arrowKeysNavigates?: boolean
    /** Set true to disable default (CMD/CTRL/ALT) + Space keyboard behaviour and instead use the keys to select items from possible child-editor. */
    spaceSelects?: boolean
    /** Set true if pressing CMD/CTRL/ALT) + Return should make new line to the caret position instead of submitting the editor.*/
    allowNewLines?: boolean
    /** Set true to limit the textarea rows to one row.*/
    singleRow?: boolean
    /** Set true to select text on focus */
    selectOnFocus?: boolean
    /** Set true to allow resizing using HTML5 resizing handle */
    resizeable?: boolean
    /** Set true to disallow editing */
    disabled?: boolean
    /** When blurring the input, we submit the input */
    blurSubmits?: boolean
    /** When pressing return on the input, we submit the input */
    returnSubmits?: boolean
    /** If input HTML type is number */
    numeric?: boolean
    /** Step that this value increments if numeric */
    step?: number
    /** Minimum number or undefined if not any. Only applicable to numeric type */
    min?: number | undefined
    /** Maximum number or undefined if not any. Only applicable to numeric type */
    max?: number | undefined
    /** Set true to stop mousedown event propagation. Needed in cell editors, so editor doesn't close when selecting text. */
    stopMousedown?: boolean
}

export interface TextEditorEmits {
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
    (e: 'click', event: MouseEvent): void
    (e: 'navigate:right'): void
    (e: 'navigate:left'): void
    (e: 'navigate:up'): void
    (e: 'navigate:down'): void
    (e: 'keydown', event: KeyboardEvent): void
    (e: 'select:prev', event: KeyboardEvent): void
    (e: 'select:first', event: KeyboardEvent): void
    (e: 'select:next', event: KeyboardEvent): void
    (e: 'select:last', event: KeyboardEvent): void
    (e: 'select:prevpage', event: KeyboardEvent): void
    (e: 'select:nextpage', event: KeyboardEvent): void
    (e: 'select:space', event: KeyboardEvent): void
    (e: 'navigate:pageup'): void
    (e: 'navigate:pagedown'): void
    (e: 'caret:change', position: number): void
    (e: 'update:modelValue', value: string | null): void
    (e: 'submit', value: string | null): void
    (e: 'cancel', value: string | null): void
    (e: 'change-preferred-size'): void
}

interface UsesTextEditor {
    internalValue: Ref<string | null>
    maxValueReached: Ref<boolean>
    numRows: ComputedRef<number | undefined>
    characterCount: ComputedRef<number>
    counterTitle: ComputedRef<string>
    counterPosition: ComputedRef<StyleValue>
    inputType: ComputedRef<'text' | 'number'>
    getInputElement: () => HTMLElement | null
    recalculateSize: () => Promise<void>
    focus: () => Promise<void>
    blur: () => Promise<void>
    handleFocus: (event: FocusEvent) => void
    handleBlur: (event: FocusEvent) => void
    handleClick: (event: MouseEvent) => void
    handleKeyboardEvent: (event: KeyboardEvent) => Promise<void>
    handleCopyPaste: () => Promise<void>
    updatePosition: () => Promise<void>
    emitDelayedPreferredSize: () => void
}

export const textEditorDefaults = {
    modelValue: '',
    placeholder: '',
    showCounter: true,
    maxLength: -1,
    updownSelects: false,
    arrowKeysNavigates: false,
    spaceSelects: false,
    allowNewLines: true,
    singleRow: false,
    selectOnFocus: false,
    resizeable: false,
    disabled: false,
    blurSubmits: false,
    returnSubmits: true,
    numeric: false,
    step: undefined,
    min: undefined,
    max: undefined,
    stopMousedown: false,
}

export function useTextEditor(
    props: TextEditorProps,
    emit: TextEditorEmits,
    templateRefs: TemplateRefs
): UsesTextEditor {
    const { emitPreferredSize, emitDelayedPreferredSize } = useDebounce(emit)
    const { input } = templateRefs

    /* Overridden internal value type to be a string */
    const internalValue = ref<string | null>(null)
    /** Original value that the edit was started with. */
    const originalValue = ref<string | null>(null)
    /** Flag to check we don't submit same value twice */
    const hasSubmitted = ref<boolean>(false)
    /* Calculated and cached TextArea HTML element width for positioning the counter text */
    const textAreaWidth = ref<number>(0)
    /* Calculated and cached TextArea HTML element height for positioning the counter text */
    const textAreaHeight = ref<number>(0)
    /** If typing longer text than maxValue, we will turn the counter to red to indicate to the user that limit has been met */
    const maxValueReached = ref<boolean>(false)

    /** Calculate Textarea rows property */
    const numRows = computed<number | undefined>(() => (props.singleRow ? 1 : undefined))
    /** Number of characters in the value */
    const characterCount = computed<number>(() => internalValue.value?.length || 0)
    /** Tooltip title for the counter value */
    const counterTitle = computed<string>(() => {
        const maxL =
            props.maxLength && props.maxLength > 0 ? `, out of max ${props.maxLength} ` : ' '

        return `Text length is ${characterCount.value}${maxL}characters`
    })

    /** Calculated counter position CSS style */
    const counterPosition = computed<StyleValue>(() => ({
        width: textAreaWidth.value + 'px',
    }))

    /** HTML input type */
    const inputType = computed<'text' | 'number'>(() => (props.numeric ? 'number' : 'text'))

    watch(
        () => props.modelValue,
        (newValue: string | number | null) => {
            if (typeof newValue === 'number') {
                newValue = newValue.toString()
            }

            originalValue.value = newValue
            internalValue.value = newValue
        }
    )

    watch(internalValue, (newValue: string | null) => {
        if (props.disabled) {
            return
        }

        if (newValue && props.maxLength && props.maxLength > 0) {
            maxValueReached.value = newValue.length >= props.maxLength
            newValue = newValue.substring(0, props.maxLength)
        }

        hasSubmitted.value = false

        handleChange(newValue)
        emitPreferredSize()
        handleCaretPositionChange()
    })

    onMounted(() => {
        // Add resize observer to to determine when textarea dimensions change to position counter
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                repositionCounter(entry.contentRect)
            }
        })

        if (input?.value) {
            ro.observe(input.value)
        }

        recalculateSize()
    })

    /** Pass the Textarea HTML element to parent for resizing purposes */
    function getInputElement(): HTMLElement | null {
        return input?.value || null
    }

    /** Clears the Textarea style */
    async function recalculateSize(): Promise<void> {
        await resetTextAreaSize()
    }

    /** Focus the Textarea HTML input */
    async function focus(): Promise<void> {
        await nextTick()
        if (input?.value) {
            input.value.select()
            if (!props.numeric) {
                setCaretPosition(input.value, input.value.value.length, input.value.value.length)
            }

            handleCaretPositionChange()
        }
    }

    /** Blur the Textarea HTML input */
    async function blur(): Promise<void> {
        await nextTick()
        if (input?.value) {
            input.value.blur()
        }
    }

    /**
     * When Textarea changes size, position the counter to bottom.
     * Note: this can't be done just with CSS as TextArea HTML element is the one doing the resizing.
     */
    function repositionCounter(rect: Partial<DOMRectReadOnly>): void {
        textAreaWidth.value = rect.width || 0
        textAreaHeight.value = rect.height || 0
    }

    /** Handler when Textarea input has been focused */
    function handleFocus(event: FocusEvent): void {
        if (props.selectOnFocus) {
            const target = event.target as HTMLInputElement
            target.select()
        }

        emit('focus', event)
        emitPreferredSize()
    }

    /** Handler when Textarea input has lost focus */
    function handleBlur(event: FocusEvent): void {
        emit('blur', event)
        emitPreferredSize()

        if (props.blurSubmits) {
            submit()
        }
    }

    /** Handler when user clicks the input */
    function handleClick(event: MouseEvent): void {
        emit('click', event)
        emitPreferredSize()
    }

    /** Handler when user has pressed key in Textarea input */
    async function handleKeyboardEvent(event: KeyboardEvent): Promise<void> {
        // catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
        const ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey

        if (!input?.value) {
            return
        }

        const caretPosition = getCaretPosition(input.value)

        switch (event.key) {
            case 'ArrowRight':
                if (!props.arrowKeysNavigates) {
                    event.stopPropagation()
                } else {
                    emit('navigate:right')
                    event.preventDefault()
                }

                break

            case 'ArrowLeft':
                if (!props.arrowKeysNavigates) {
                    event.stopPropagation()
                } else {
                    emit('navigate:left')
                    event.preventDefault()
                }

                break

            case 'ArrowUp':
                if (!props.arrowKeysNavigates || props.updownSelects) {
                    event.stopPropagation()
                } else {
                    if (props.arrowKeysNavigates) {
                        emit('navigate:up')
                        event.preventDefault()
                    }
                }

                if (props.updownSelects) {
                    event.preventDefault()
                    handleCaretPositionChange()
                    emit('select:prev', event)
                    return
                }

                break

            case 'ArrowDown':
                if (!props.arrowKeysNavigates || props.updownSelects) {
                    event.stopPropagation()
                } else {
                    if (props.arrowKeysNavigates) {
                        emit('navigate:down')
                        event.preventDefault()
                    }
                }

                if (props.updownSelects) {
                    event.preventDefault()
                    handleCaretPositionChange()
                    emit('select:next', event)
                    return
                }

                break

            case 'Home':
                event.stopPropagation()

                if (props.updownSelects && ctrlDown) {
                    event.stopPropagation()
                    event.preventDefault()
                    emit('select:first', event)
                    return
                }

                break

            case 'End':
                event.stopPropagation()

                if (props.updownSelects && ctrlDown) {
                    event.stopPropagation()
                    event.preventDefault()
                    emit('select:last', event)
                    return
                }

                break

            case 'PageDown':
                if (!props.arrowKeysNavigates) {
                    event.stopPropagation()
                } else {
                    emit('navigate:pagedown')
                }

                if (props.updownSelects && !ctrlDown) {
                    event.stopPropagation()
                    event.preventDefault()
                    emit('select:nextpage', event)
                    return
                }

                break

            case 'PageUp':
                if (!props.arrowKeysNavigates) {
                    event.stopPropagation()
                } else {
                    emit('navigate:pageup')
                }

                if (props.updownSelects && !ctrlDown) {
                    event.stopPropagation()
                    event.preventDefault()
                    emit('select:prevpage', event)
                    return
                }

                break

            case 'Enter': {
                if (props.allowNewLines && (ctrlDown || event.altKey)) {
                    // if ctrl+enter or alt+enter, add new line
                    const value = internalValue.value?.toString() || ''

                    const newValue = `${value.slice(0, caretPosition)}\n${value.slice(
                        caretPosition
                    )}`

                    internalValue.value = newValue

                    event.stopPropagation()
                    event.preventDefault()

                    await nextTick()

                    if (!props.numeric) {
                        setCaretPosition(input.value, caretPosition + 1, caretPosition + 1)
                    }
                } else {
                    if (props.returnSubmits) {
                        submit()
                        handleCaretPositionChange()
                    }

                    emit('keydown', event)
                    return
                }

                event.preventDefault() // don't add newline to field
                break
            }

            case 'Escape': {
                cancel()
                handleCaretPositionChange()
                emit('keydown', event)
                break
            }

            case 'Space': {
                if (props.spaceSelects && (ctrlDown || event.altKey)) {
                    event.preventDefault()
                    event.stopPropagation()
                    emit('select:space', event)
                    return
                }

                break
            }

            case 'Backspace':
            case 'Delete':
                event.stopPropagation() // backspace, delete, should only work locally when cell is edited (not in table context)
                break

            default:
                break
        }

        emit('keydown', event)
        handleCaretPositionChange()
    }

    /** Handles case when copy paste happens inside text editor. */
    async function handleCopyPaste(): Promise<void> {
        await handleCaretPositionChange()
        emitDelayedPreferredSize()
    }

    /** Updates and emits caret position change */
    async function handleCaretPositionChange(): Promise<void> {
        await nextTick()
        if (!input?.value) {
            return
        }

        const position = getCaretPosition(input.value)
        emit('caret:change', position)
    }

    /** Helper method to clear the TextArea style for resizing purposes */
    async function resetTextAreaSize(): Promise<void> {
        if (input?.value) {
            input.value.style.height = 'auto'
            await nextTick()
            if (input.value) {
                input.value.style.height = ''
            }
        }
    }

    /** Handler when editor submits the value edit. Usually by user pressing "return" from keyboard. */
    function submit(): void {
        if (hasSubmitted.value) {
            return
        }

        hasSubmitted.value = true
        emit('update:modelValue', internalValue.value)
        emit('submit', internalValue.value)
    }

    /** Handler when editor cancels the value edit. Usually by user pressing "esc" from keyboard. */
    function cancel(): void {
        internalValue.value = originalValue.value

        if (internalValue.value?.length === 0 && props.numeric) {
            internalValue.value = null
        }

        hasSubmitted.value = true
        emit('update:modelValue', internalValue.value)
        emit('cancel', internalValue.value)
    }

    function handleChange(value: string | null): void {
        internalValue.value = value
        emit('update:modelValue', value)
    }

    async function updatePosition(): Promise<void> {
        return undefined
    }

    return {
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
    }
}
