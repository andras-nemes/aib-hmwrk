import type { StrictModifiers, Modifier, Instance } from '@popperjs/core'
import type {
    ComplexDropdownItemHoverEventFunction,
    HotCellValue,
} from 'components/shared/CrudTableEditor/HotTable/types/HotColumnProperties'
import type { Ref } from 'vue'
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { createPopper } from '@popperjs/core'
import type { TemplateRefs } from './useValueEditor'
import type { CellColor } from '../CrudTableEditor/constants'

/**
 * Extend PopperModifiers to support our own modifier, which makes the popper width the same as trigger element.
 */
type SameWidthModifier = Modifier<'samewidth', { customOption: boolean }>

export type ExtendedModifiers = StrictModifiers | SameWidthModifier

/**
 * Interface for the Dropdown item.
 */
export interface Item {
    /** Value for the dropdown item. Property 'value' of this editor will be matched to this */
    value: string
    /** Unique Id to distinquish items */
    id: string | number | null
    /** Label for the dropdown item. If not defined, value is used */
    label?: string
    /** Tooltip text for the dropdown item. If not defined, label is used. */
    title?: string
    /** Optional command text to append to the string */
    command?: string
    /** Optional icon for the dropdown item */
    icon?: string
    /** Optional color for the dropdown item. Only supported colors can be set. */
    color?: CellColor
    /** If option is disabled */
    disabled?: boolean
    /** True, if we want to show this option, if not, then set false. */
    visible?: boolean
    /** Optional arbitrary data attributes for dropdown LI element */
    elementDataAttributes?: {
        rowId?: string | number
        itemId?: string | number
        rowData?: HotCellValue[]
        [key: string]: unknown
    }
    /** Callback function when hovering over dropdown item */
    hoverCallback?: ComplexDropdownItemHoverEventFunction
}

export interface SelectEditorProps {
    /** Override value type to be string, or set the selected index from dropdown items */
    modelValue?: string | number | boolean | null
    /** Override default value type to be string, or set the selected index from dropdown items */
    defaultValue?: string | number | boolean | null
    placeholder?: string
    showCounter?: boolean
    maxLength?: number
    /** Set true if the editor should not submit value that does not exist in the dropdown list */
    strict?: boolean
    updownSelects?: boolean
    /** Set true to disable default left and right, and home and end keyboard behaviour and instead use the keys to move to next or prev editor */
    arrowKeysNavigates?: boolean
    /** Items to show in dropdown list. */
    items?: Item[]
    /** Set true if from the editor it is possible to create new items not in the list. */
    creatable?: boolean
    /** Set true if pressing CMD/CTRL/ALT) + Return should make new line to the caret position instead of submitting the editor. */
    allowNewLines?: boolean
    /** Initial value to be used for filtering. */
    filterValue?: string
    singleRow?: boolean
    /** Set true to select text on focus */
    selectOnFocus?: boolean
    resizeable?: boolean
    /** Is field editor disabled */
    disabled?: boolean
    /** When selecting item, close the dropdown and submit value */
    submitAndClose?: boolean
    /** When focusing dropdown, show dropdown. Note clicking / typing on input always shows dropdown */
    openDropdownOnFocus?: boolean
    /** If true, traps focus inside the editor */
    trapFocus?: boolean
    /** When filtering items with value, use this function */
    filterFunction?: (value: string, item: Item) => Item | null
    /** If pressing return on the editor submits the value. Default is true, but HOT editors set this to false */
    returnSubmits?: boolean
}

/** Debounce time in miliseconds to prevent user from triggering too many mouse hover events while browsing through dropdown. */
export const HOVER_DEBOUNCE_TIME = 100

export const selectEditorDefaultProps = {
    modelValue: null,
    defaultValue: null,
    placeholder: '',
    showCounter: true,
    maxLength: -1,
    strict: false,
    updownSelects: false,
    arrowKeysNavigates: false,
    items: () => [],
    creatable: true,
    allowNewLines: true,
    filterValue: '',
    selectOnFocus: false,
    singleRow: false,
    resizeable: false,
    disabled: false,
    submitAndClose: true,
    openDropdownOnFocus: false,
    trapFocus: true,
    filterFunction: () => null,
    returnSubmits: true,
}

export interface SelectEditorEmits {
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
    (e: 'keydown', event: KeyboardEvent): void
    (e: 'update:modelValue', value: string | number | null): void
    (e: 'submit', item: Item): void
    (e: 'cancel', item: Item): void
    (e: 'change-preferred-size'): void
}

interface UsesSelectEditor {
    selectedIndex: Ref<number>
    internalValue: Ref<string | number | boolean>
    originalValue: Ref<string | number | boolean>
    popperInstance: Ref<Instance | null>
    internalFilterValue: Ref<string>
    internalTextEditorValue: Ref<string>
    isDropdownShown: Ref<boolean>
    hasSubmitted: Ref<boolean>
    browsingTimeout: Ref<number | null>
    triggerHoverCallback: (event: MouseEvent, item: Item) => void
    showDropdown: () => Promise<void>
    destroyPopper: () => void
    hideDropdown: () => Promise<void>
}

export function useSelectEditor(templateRefs: TemplateRefs): UsesSelectEditor {
    const { editor, dropdown } = templateRefs

    /** Currently selected index in the dropdown list */
    const selectedIndex = ref<number>(-1)
    const internalValue = ref<string | number | boolean>('')
    const originalValue = ref<string | number | boolean>('')
    /** Popper to position the dropdown */
    const popperInstance = ref<Instance | null>(null)
    /** Value to be used for filtering. */
    const internalFilterValue = ref<string>('')
    /** Internal Text Editor value */
    const internalTextEditorValue = ref<string>('')
    /** True if dropdown is currently shown. */
    const isDropdownShown = ref<boolean>(false)
    /** Flag to check editor doesn't submit same value twice */
    const hasSubmitted = ref<boolean>(false)
    /** Timeout for evaluating if user is still browsing (rapidly mouse-hovering) the dropdown */
    const browsingTimeout = ref<number | null>(null)

    onBeforeUnmount(() => destroyPopper())

    /** Trigger the hoverCallback function of item. */
    function triggerHoverCallback(event: MouseEvent, item: Item): void {
        const hoverCallback = item.hoverCallback
        const rowData = item.elementDataAttributes?.rowData
        const itemId = item.elementDataAttributes?.itemId
        if (typeof hoverCallback === 'function' && rowData) {
            hoverCallback(itemId, rowData, event)
        }
    }

    /** Helper method to show the dropdown. */
    async function showDropdown(): Promise<void> {
        if (isDropdownShown.value) {
            return
        }

        isDropdownShown.value = true
        internalFilterValue.value = ''

        if (!dropdown?.value) {
            return
        }

        if (!editor?.value) {
            return
        }

        const trigger = editor.value.getInputElement()
        if (!trigger) {
            return
        }

        popperInstance.value = createPopper<ExtendedModifiers>(trigger, dropdown.value, {
            placement: 'bottom-start',
            strategy: 'fixed',
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [-1, 1],
                    },
                },
                {
                    name: 'samewidth',
                    enabled: true,
                    fn: ({ state }) => {
                        state.styles.popper.width = `${state.rects.reference.width}px`
                    },
                    phase: 'beforeWrite',
                    requires: ['computeStyles'],
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
    }

    /** Clean PopperJS instance */
    function destroyPopper(): void {
        if (popperInstance.value) {
            popperInstance.value.destroy()
            popperInstance.value = null
        }
    }

    /** Helper method to hide the dropdown. */
    async function hideDropdown(): Promise<void> {
        isDropdownShown.value = false
        destroyPopper()
    }

    return {
        selectedIndex,
        internalValue,
        originalValue,
        popperInstance,
        internalFilterValue,
        internalTextEditorValue,
        isDropdownShown,
        hasSubmitted,
        browsingTimeout,
        triggerHoverCallback,
        showDropdown,
        destroyPopper,
        hideDropdown,
    }
}
