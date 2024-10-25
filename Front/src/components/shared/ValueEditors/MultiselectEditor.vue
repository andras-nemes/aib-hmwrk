<template>
    <TextEditor
        ref="editor"
        v-click-away="handleClickAway"
        :model-value="internalTextEditorValue"
        class="a-multiselect-editor a-autocomplete-editor"
        :placeholder="placeholder"
        :max-length="maxLength"
        :show-counter="showCounter"
        :allow-new-lines="allowNewLines"
        :arrow-keys-navigates="arrowKeysNavigates"
        :single-row="singleRow"
        :disabled="disabled"
        :class="{'has-dropdown': isDropdownShown}"
        updown-selects
        space-selects
        @click="showRefreshedDropdown"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @caret:change="value => handleCaretPositionChange(value)"
        @select:next="selectStep(1)"
        @select:prev="selectStep(-1)"
        @select:nextpage="selectStep(10)"
        @select:prevpage="selectStep(-10)"
        @select:first="selectIndex(0)"
        @select:last="selectIndex(filteredItems.length-1)"
        @select:space="() => selectCurrent()"
        @change-preferred-size="emitPreferredSize"
        @submit="submit"
        @cancel="cancel"
        @update:model-value="updateInternalTextEditorValue"
    >
        <template #before>
            <slot name="before" />
        </template>

        <template #after>
            <slot name="after" />
            <div
                v-show="isDropdownShown"
                ref="dropdown"
                class="dropdown depth-12"
                @wheel.stop=""
                @click.stop=""
                @mouseup.stop=""
                @mousedown.stop=""
            >
                <ul
                    v-if="$slots.noitems"
                >
                    <slot name="noitems" />
                </ul>
                <ul
                    v-else-if="filteredItems.length === 0"
                >
                    <slot
                        name="noresults"
                    >
                        <li>{{ $t('components.multiselect.no-items-option.label') }}</li>
                    </slot>
                </ul>
                <ul
                    v-else
                >
                    <template
                        v-for="(item, index) in filteredItems"
                    >
                        <slot
                            name="item"
                            :item="item"
                            :index="index"
                        >
                            <li
                                v-if="item"
                                v-show="item.visible !== false"
                                v-bind="mapElementDataAttributesForBinding(item)"
                                ref="itemsRef"
                                :key="'dropdown-item-' + (item.id || index)"
                                :title="item.title || item.label"
                                class="listitem"
                                :class="classForItem(item)"
                                @mousedown.prevent=""
                                @click="event => handleItemClick(event, item)"
                                @mouseenter="event => handleMouseEnter(event, item)"
                            >
                                <a-checkbox-field
                                    v-if="item.id"
                                    no-label-element
                                    :model-value="itemIsChecked(item)"
                                    :disabled="item.disabled"
                                    @update:model-value="(value: string | number) => handleItemClick(null, item)"
                                >
                                </a-checkbox-field>
                                <span
                                    v-if="item.icon"
                                    class="icon"
                                >{{ item.icon }}</span>
                                <span
                                    v-if="item.command"
                                    class="command"
                                >{{ item.command }}&nbsp;</span>
                                <span class="value">{{ item.label || item.value }}</span>
                                <span
                                    v-if="item.color"
                                    class="notice"
                                ><i class="fas fa-exclamation-triangle" /></span>
                            </li>
                        </slot>
                    </template>
                </ul>
            </div>
        </template>
    </TextEditor>
</template>

<script setup lang="ts">
/**
 * MultiselectEditor extends AutocompleteEditor and shows checkboxes in front of items which can be selected by user
 * to form a list of entries as data value.
 */
import { isEmpty, splitBySemicolon } from 'lib/helpers'
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue'
import TextEditor from './TextEditor.vue'
import type { Item, SelectEditorEmits, SelectEditorProps } from './useSelectEditor'
import { HOVER_DEBOUNCE_TIME, selectEditorDefaultProps, useSelectEditor } from './useSelectEditor'
import { directive as vClickAway } from 'vue3-click-away'
import { useI18n } from 'vue-i18n'
import { useDebounce } from './useDebounce'
import scrollIntoView from 'scroll-into-view-if-needed'
import { useGlobalRefsStore } from 'lib/GlobalRefsStore'

const SelectAll = 'SelectAll'

// For reducing and sorting dropdown items into selected and non selected ones.
type SortedOptions = {
    selected: Omit<Item, 'elementDataAttributes'>[]
    nonSelected: Omit<Item, 'elementDataAttributes'>[]
}

type Props = SelectEditorProps & {
    hasSelectAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    ...selectEditorDefaultProps,
    allowNewLines: false,
    hasSelectAll: true,
})

type Emits = SelectEditorEmits & {
    (e: 'submit', item: string | number | boolean, values: string[]): void
    (e: 'update:modelValue', value: string | number | boolean, values: string[]): void
}

const emit = defineEmits<Emits>()
const { t } = useI18n()
const globalRefsStore = useGlobalRefsStore()

const editor = ref<InstanceType<typeof TextEditor> | null>(null)
const dropdown = ref<HTMLElement | null>(null)
const itemsRef = ref<Element[] | null>(null)

const {
    selectedIndex,
    internalValue,
    originalValue,
    popperInstance,
    internalFilterValue,
    internalTextEditorValue,
    isDropdownShown,
    browsingTimeout,
    triggerHoverCallback,
    showDropdown,
    hideDropdown,
} = useSelectEditor({ editor, dropdown })

const { emitPreferredSize } = useDebounce(emit)

/** List of selected AutocompleteItems */
const checkedValues = ref<string[]>([])
/** Currently selected item's value in the dropdown list */
const selectedValue = ref<string | null>(null)
/** Current texteditor caret position to see which item to consider as filter*/
const currentTextCaretPos = ref<number>(-1)
/** True if all items are selected */
const allSelected = ref<boolean>(false)
/** Internal dropdown items with custom ordering logic. */
const internalItems = ref<Item[]>([])

/**
 * Omitting elementDataAttributes here to avoid TypeScript error:
 * Type instantiation is excessively deep and possibly infinite. ts-plugin(2589)
 */
function isItemAvailable(item: Omit<Item, 'elementDataAttributes'>): boolean {
    return item.id !== null && item.visible !== false && item.disabled !== true
}

/** Visible and non-disabled items */
const availableItems = computed(() => internalItems.value.filter(isItemAvailable))

const filteredItems = computed<Item[]>(() => {
    const value = internalFilterValue.value?.toString()
    const search = value?.trim() || ''

    type FirstOption = Pick<Item, 'id' | 'label' | 'value' | 'title' | 'command'>

    // 1. Formulate the first option in dropdown
    const emptyOption: FirstOption = {
        id: null,
        label: t('components.multiselect.no-items-option.label'),
        value: '',
        title: t('components.multiselect.no-items-option.title'),
    }

    const selectAllOption: FirstOption = {
        id: SelectAll,
        label: t('components.multiselect.select-all-option.select-all'),
        value: t('components.multiselect.select-all-option.select-all'),
        title: t('components.multiselect.select-all-option.title'),
    }

    // Only count the visible items
    const firstOption = availableItems.value.length > 0 ? selectAllOption : emptyOption

    if (search.length == 0) {
        return props.hasSelectAll ? [firstOption, ...internalItems.value] : internalItems.value
    }

    // 2. Handle filtering
    const filtered = internalItems.value.reduce((acc: FirstOption[], item: FirstOption) => {
        // Evaluated item against current search
        const label = item.label?.toString() || item.value?.toString() || ''
        const compare = label.trim()
        // toLowerCase() is used to make the search case-insensitive
        if (compare.toLowerCase().indexOf(search.toLowerCase()) > -1) {
            acc.push(item)
        }

        return acc
    }, [])

    //  If items are filtered, change the label and title of "Select All" option.
    if (filtered.length < internalItems.value.length) {
        selectAllOption.label = t('components.multiselect.select-all-option.select-all-filtered')
        selectAllOption.title = t('components.multiselect.select-all-option.title-filtered')
    }

    // If dropdown is creatable and filter value has no match, add Create: {option} to add new value.
    if (props.creatable) {
        const index = internalItems.value.findIndex((item: FirstOption) =>
            props.filterFunction(internalFilterValue.value, item)
        )

        const newItem = index === -1

        if (newItem) {
            filtered.push({
                id: internalFilterValue.value,
                value: internalFilterValue.value,
                command: t('components.multiselect.create-option.command'),
                label: internalFilterValue.value,
                title: t('components.multiselect.create-option.command', {
                    option: internalFilterValue.value,
                }),
            })
        }
    }

    return props.hasSelectAll ? [firstOption, ...filtered] : filtered
})

watch(
    () => props.modelValue,
    (newValue, oldValue) => {
        originalValue.value = newValue || ''
        checkedValues.value = convertValueToItemList(String(newValue))
        setValue(newValue as string)

        // Order items once at the beginning, when values are loaded.
        // No need to order items if no options is selected and value is empty.
        if (isEmpty(oldValue) && !isEmpty(newValue)) {
            orderItems()
        }
    }
)

watch(checkedValues, newValue => {
    allSelected.value =
        filteredItems.value.length > 1 &&
        filteredItems.value
            .slice(1) // Exclude "Select All"
            .filter(isItemAvailable)
            .map(item => item.value)
            .every(v => newValue.includes(v))
})

watch(filteredItems, newValue => {
    allSelected.value =
        newValue.length > 1 &&
        newValue
            .slice(1) // Exclude "Select All"
            .filter(isItemAvailable)
            .map(item => item.value)
            .every(v => checkedValues.value.includes(v))
})

/** When items change, set the value to match the internal value */
watch(
    () => props.items,
    (newValue: Omit<Item, 'elementDataAttributes'>[]) => {
        internalItems.value = newValue
        setValue(internalValue.value)
        // Order items again when if given items prop changes,
        orderItems()
    }
)

onMounted(() => {
    internalValue.value = ''
    originalValue.value = ''
    checkedValues.value = convertValueToItemList(String(props.modelValue))
    selectedIndex.value = -1
    internalFilterValue.value = props.filterValue
    internalItems.value = props.items as Omit<Item, 'elementDataAttributes'>[]
})

function updateInternalTextEditorValue(value: string | null): void {
    internalTextEditorValue.value = value || ''
    handleTextChange(value || '')
}

/** Order selected items first */
function orderItems(): void {
    const sortedLists: SortedOptions = internalItems.value.reduce(
        (acc: SortedOptions, item: Omit<Item, 'elementDataAttributes'>) => {
            itemIsChecked(item) ? acc.selected.push(item) : acc.nonSelected.push(item)
            return acc
        },
        {
            selected: [],
            nonSelected: [],
        }
    )

    internalItems.value = [...sortedLists.selected, ...sortedLists.nonSelected]
}

/**
 * Sync internal values with given items/value props.
 * Same as original Autocomplete component, except internalTextEditorValue gets sorted alphabetically.
 */
function setValue(newValue: string | number | boolean): void {
    // Reset highlighted option index and assign internal values properties according to new values given.
    selectedIndex.value = -1
    internalValue.value = newValue?.toString()
    originalValue.value = internalValue.value

    // Sort internalTextEditorValue alphabetically before displaying in multiselect text area.
    internalTextEditorValue.value = convertItemListToValue(
        convertValueToItemList(internalValue.value).sort((a, b) => {
            return a.localeCompare(b)
        })
    )

    selectedIndex.value = internalItems.value.findIndex(item => item.value === internalValue.value)
    handleSelectedIndexChange()
}

/** Returns true if item should be rendered as checked */
function itemIsChecked(item: Item): boolean {
    // returns true if one of the following conditions apply
    // - If the item is 'Select All' and all items are selected
    // - If the value is in the checked values list
    if (item.id === SelectAll) {
        return allSelected.value
    }

    return !!(checkedValues.value.indexOf(item.value) > -1)
}

/** Converts internal value to data value by splitting the value by semicolon and mapping to autocomplete items */
function convertValueToItemList(value: string): string[] {
    return splitBySemicolon(value).map(v => v)
}

/** Converts internal value to data value by concatenating the array to semicolon separated list of values */
function convertItemListToValue(itemList: string[]): string {
    let multiselectValue = ''
    if (itemList && itemList.length) {
        itemList.forEach((key: string, idx: number) => {
            if (key) {
                const item = internalItems.value.find(v => v.value == key)

                let value = item?.value || key

                // Make sure key does not have any unescaped double quotes
                value = value.replace(/"/g, '\\"')

                // If key has a separator or double quote, we will enclose it to quotes
                if (value.indexOf(';') > -1 || value.indexOf('"') > -1) {
                    value = `"${value}"`
                }

                multiselectValue += `${idx > 0 ? ' ' : ''}${value};`
            }
        })
    }

    return multiselectValue || ''
}

/** When selected item in dropdown list has been changed */
function handleSelectedIndexChange(): void {
    const items = filteredItems.value || []
    if (selectedIndex.value >= 0 && selectedIndex.value < items.length) {
        selectedValue.value = items[selectedIndex.value]?.value || ''
        scrollItemIntoView(selectedIndex.value)
    } else {
        selectedValue.value = null
    }
}

/** Computed class for dropdown item */
function classForItem(item: Item): Record<string, unknown> {
    return {
        empty: !item.id,
        selected: selectedValue.value == item.value,
        disabled: item.disabled,
        'has-icon': item.icon,
        'select-all-option': item.id === SelectAll,
        [item.color || 'default']: true,
    }
}

/**
 * Sets internal value and emits change
 * @param newVal New value to be set
 * @param removeItems Remove items selection, if they can't be found
 */
function setInternalValue(newVal: string, removeItems = true): void {
    let values = checkedValues.value

    const compareValue = newVal
    const io = values.findIndex(v => {
        return v == compareValue
    })

    if (io > -1) {
        if (removeItems) {
            // If value is already in values, we remove it from values
            values = values.filter(v => {
                return v !== compareValue
            })
        }
    } else {
        // otherwise we add it to the list of values
        values.push(newVal)
    }

    checkedValues.value = values

    // Sort internalTextEditorValue alphabetically before displaying in multiselect text area.
    internalTextEditorValue.value = `${convertItemListToValue(
        values.sort((a, b) => {
            return a.localeCompare(b)
        })
    )} ${internalFilterValue.value}`

    handleChange(convertItemListToValue(values))
    emitPreferredSize()
}

/** Handler when item is clicked from the dropdown list */
async function handleItemClick(event: MouseEvent | null, item: Item): Promise<void> {
    if (event) {
        event.preventDefault()
    }

    if (item?.disabled) {
        return
    }

    const fValue = internalFilterValue.value
    checkedValues.value = checkedValues.value.filter(v => v !== fValue)

    const hasFilter = !isEmpty(internalFilterValue.value)

    // Make sure that 'Select All' (not 'No items') option was clicked.
    if (item.id === SelectAll) {
        handleSelectAll()
    } else {
        allSelected.value = false
        setInternalValue(item.value)
    }

    // Order items when user select/unselect an item from filter results
    hasFilter && orderItems()
}

/** Handler when Select All option is clicked from the dropdown */
function handleSelectAll(): void {
    if (allSelected.value) {
        allSelected.value = false

        const filteredItemsValues = filteredItems.value.map(i => i.value)
        checkedValues.value = checkedValues.value.filter(v => filteredItemsValues.indexOf(v) === -1)

        internalTextEditorValue.value = `${convertItemListToValue(checkedValues.value)} ${
            internalFilterValue.value
        }`

        handleChange(convertItemListToValue(checkedValues.value))
    } else {
        const values: string[] = checkedValues.value.concat(
            filteredItems.value
                .slice(1) // Exclude "Select All"
                .filter(item => !checkedValues.value.includes(item.value) && isItemAvailable(item))
                .map(item => item.value)
        )

        allSelected.value = true
        checkedValues.value = values
        internalTextEditorValue.value = `${convertItemListToValue(values)} ${
            internalFilterValue.value
        }`

        handleChange(convertItemListToValue(values))
        emitPreferredSize()
    }
}

async function handleMouseEnter(event: MouseEvent, item: Item): Promise<void> {
    if (browsingTimeout.value) {
        clearTimeout(browsingTimeout.value)
    }

    browsingTimeout.value = window.setTimeout(() => {
        triggerHoverCallback(event, item)
    }, HOVER_DEBOUNCE_TIME)
}

/**
 * Adds currently selected item to list of values.
 * @param removeItems If true, removes items not in the list from list of selected. Defaults to true.
 */
function selectCurrent(removeItems = true): void {
    if (selectedValue.value) {
        const item = internalItems.value.find(v => v.value == selectedValue.value)

        if (!item || item.disabled) {
            return
        }

        const fValue = internalFilterValue.value
        checkedValues.value = checkedValues.value.filter(v => v !== fValue)

        if (selectedValue.value.length > 0) {
            setInternalValue(selectedValue.value, removeItems)
        }
    } else {
        handleChange('')
    }
}

/**
 * Handler when Text editor caret position changes. We calculate the filter value to be the value between semicolons in textarea
 * @param position New position for the caret
 */
function handleCaretPositionChange(position: number): void {
    if (position < 0) {
        internalFilterValue.value = ''
        return
    }

    currentTextCaretPos.value = position
    let caretPosStart = currentTextCaretPos.value
    let caretPosEnd = currentTextCaretPos.value

    const value = String(internalValue.value)

    // Find previous item separator
    while (caretPosStart > 0 && value[caretPosStart - 1] !== ';') {
        caretPosStart--
    }

    // Find next item separator
    while (caretPosEnd <= value.length && value[caretPosEnd + 1] !== ';') {
        caretPosEnd++
    }

    let currentFilterValue = value.substring(caretPosStart, caretPosEnd).trim()

    if (currentFilterValue.endsWith(';')) {
        currentFilterValue = currentFilterValue.substring(0, -1).trim()
    }

    internalFilterValue.value = currentFilterValue
}

/** Handler when TextEditor value has changed */
function handleTextChange(value: string): void {
    internalValue.value = value

    const trimmedValue = value.trim()

    const lastSemicolonIndex = trimmedValue.lastIndexOf(';')
    const valueWithoutFilter =
        lastSemicolonIndex > -1 ? trimmedValue.substring(0, lastSemicolonIndex) : ''

    checkedValues.value = convertValueToItemList(valueWithoutFilter).filter(key => {
        const item = internalItems.value.find(v => v.value == key)
        return item && !item.disabled
    })

    // If the last character is a semicolon, emit modelValue change to save the value.
    if (lastSemicolonIndex === trimmedValue.length - 1) {
        internalFilterValue.value = ''
        handleChange(value)
    }
}

/** Submits the value. */
function submit(): void {
    selectCurrent(false)
    // When we submit, we will remove duplicates
    const values = [...new Set(checkedValues.value)]
    checkedValues.value = values
    const stringValue = convertItemListToValue(values)
    internalValue.value = stringValue
    internalTextEditorValue.value = stringValue
    internalFilterValue.value = ''
    emit('update:modelValue', internalValue.value, values)
    emit('submit', internalValue.value, values)
    blur()
    hideDropdown()
}

/** Cancel value edit. */
function cancel(): void {
    internalValue.value = originalValue.value
    internalTextEditorValue.value = internalValue.value.toString()
    const values = convertValueToItemList(internalValue.value.toString())
    checkedValues.value = values
    internalFilterValue.value = ''
    emit('update:modelValue', internalValue.value, values)
    emit('submit', internalValue.value, values)

    blur()
    hideDropdown()
}

/** Map item's element data attributes to bindings */
function mapElementDataAttributesForBinding(item: Item): Record<string, unknown> | null {
    if (!item.elementDataAttributes) {
        return null
    }

    return Object.keys(item.elementDataAttributes).reduce((acc, key) => {
        acc['data-' + key] = item.elementDataAttributes?.[key] || null
        return acc
    }, {} as Record<string, unknown>)
}

function handleFocus(event: FocusEvent): void {
    if (props.openDropdownOnFocus) {
        showRefreshedDropdown()
    }

    emit('focus', event)
}

function handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Tab') {
        submit()
    } else if (event.code !== 'Enter' && event.code !== 'Escape' && event.code !== 'NumpadEnter') {
        showRefreshedDropdown()
    }

    emit('keydown', event)
}

/** Helper method to show the dropdown and reset the scroll to top */
async function showRefreshedDropdown(): Promise<void> {
    showDropdown()

    // Scroll to the top (index 0), as all selected options are at the top when dropdown opens.
    scrollItemIntoView(0)
}

function handleChange(value: string | number): void {
    internalValue.value = value
    emit('update:modelValue', value)
}

/** Helper method to scroll an item into view from the dropdown list. */
async function scrollItemIntoView(index: number): Promise<void> {
    if (!isDropdownShown.value) {
        return
    }

    if (!filteredItems.value) {
        return
    }

    if (index < 0 || index >= filteredItems.value.length) {
        return
    }

    await nextTick()
    if (!Array.isArray(itemsRef.value)) {
        return
    }

    const element = itemsRef.value[index]
    if (element) {
        scrollIntoView(element, {
            behavior: 'auto',
            scrollMode: 'always',
            block: 'nearest',
            inline: 'nearest',
        })
    }
}

/** Handler when text input loses focus */
function handleBlur(event: FocusEvent): void {
    emit('blur', event)
}

/**
 * Select next / prev item in dropdown
 * @param step Number of items to skip. Set 1 to select next, set -1 to select previous.
 */
function selectStep(step: number): void {
    const items = filteredItems.value || []
    const nextIndex = selectedIndex.value + step
    if (nextIndex > items.length - 1) {
        selectIndex(0)
    } else if (nextIndex < 0) {
        selectIndex(items.length - 1)
    } else {
        selectIndex(nextIndex)
    }
}

/** Select specific index from the dropdown */
function selectIndex(index: number): void {
    const items = filteredItems.value || []
    if (index < 0 || index > items.length - 1) {
        selectedIndex.value = -1
        return
    }

    selectedIndex.value = index
}

/** Handler when user clicks away from the dropdown list */
function handleClickAway(): void {
    if (isDropdownShown.value) {
        submit()
    }
}

/** Get the input element from TextEditor */
function getInputElement(): HTMLElement | null {
    return editor.value?.getInputElement() || null
}

/** Forward the method to the TextEditor */
async function recalculateSize(): Promise<void> {
    await editor.value?.recalculateSize()
}

/** Updates PopperJS position */
async function updatePosition(): Promise<void> {
    popperInstance.value?.update()
}

/** Focus the Text editor */
async function focus(): Promise<void> {
    return editor.value?.focus()
}

/** Blur the Text editor */
async function blur(): Promise<void> {
    return editor.value?.blur()
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

.a-multiselect-editor .select-all-option {
    border-bottom: 0.16em solid theme.$grey-lighter;
}
</style>
