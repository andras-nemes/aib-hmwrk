<template>
    <TextEditor
        ref="editor"
        v-click-away="handleClickAway"
        :model-value="internalTextEditorValue"
        class="a-autocomplete-editor"
        :placeholder="placeholder"
        :max-length="maxLength"
        :show-counter="showCounter"
        :allow-new-lines="allowNewLines"
        :arrow-keys-navigates="arrowKeysNavigates"
        :single-row="singleRow"
        :select-on-focus="selectOnFocus"
        :disabled="disabled"
        :class="{ 'has-dropdown': isDropdownShown }"
        updown-selects
        @click="showDropdown"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @select:next="selectStep(1)"
        @select:prev="selectStep(-1)"
        @select:nextpage="selectStep(10)"
        @select:prevpage="selectStep(-10)"
        @select:first="selectIndex(0)"
        @select:last="selectIndex(filteredItems.length - 1)"
        @change-preferred-size="emitPreferredSize"
        @submit="submit"
        @cancel="cancel"
        @update:model-value="updateInternalTextEditorValue"
    >
        <template #before>
            <slot name="before" />
        </template>

        <template #after>
            <div
                v-show="isDropdownShown"
                ref="dropdown"
                class="dropdown depth-12"
                @mousedown.stop=""
            >
                <ul v-if="$slots.noitems">
                    <slot name="noitems" />
                </ul>
                <ul v-else-if="filteredItems.length === 0">
                    <slot name="noresults">
                        <li class="empty">
                            No results
                        </li>
                    </slot>
                </ul>
                <ul v-else>
                    <template
                        v-for="(item, index) in filteredItems"
                        :key="'dropdown-item-' + (item.id || index)"
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
                                :title="item.title || item.label"
                                class="listitem"
                                :class="classForItem(item)"
                                @mousedown.stop=""
                                @mouseenter="event => handleMouseEnter(event, item)"
                                @click="event => handleItemClick(event, item)"
                            >
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
import TextEditor from './TextEditor.vue'
import scrollIntoView from 'scroll-into-view-if-needed'
import {
    type Item,
    selectEditorDefaultProps,
    useSelectEditor,
    HOVER_DEBOUNCE_TIME,
} from './useSelectEditor'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { directive as vClickAway } from 'vue3-click-away'
import { useDebounce } from './useDebounce'
import type { SelectEditorEmits, SelectEditorProps } from './useSelectEditor'
import { useGlobalRefsStore } from 'lib/GlobalRefsStore'

const props = withDefaults(defineProps<SelectEditorProps>(), selectEditorDefaultProps)

const emit = defineEmits<SelectEditorEmits>()
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
    hasSubmitted,
    browsingTimeout,
    triggerHoverCallback,
    showDropdown,
    hideDropdown,
} = useSelectEditor({ editor, dropdown })

const { emitPreferredSize } = useDebounce(emit)

/** List of dropdown items that has been filtered based on TextEditor value */
const filteredItems = computed<Item[]>(() => {
    const value = internalFilterValue.value?.toString()
    const search = value?.toLowerCase().trim() || ''

    if (search.length == 0) {
        return props.items
    }

    const filtered: Item[] = []

    props.items.forEach(item => {
        const label = item.label?.toString() || item.value?.toString() || ''
        const compare = label.toLowerCase().trim()
        if (compare.indexOf(search) > -1) {
            filtered.push(item)
        }
    })

    if (props.creatable) {
        const index = props.items.findIndex(item =>
            props.filterFunction(internalFilterValue.value, item)
        )

        const newItem = index === -1

        if (newItem) {
            filtered.push({
                id: internalFilterValue.value,
                value: internalFilterValue.value,
                command: 'Create:',
                label: internalFilterValue.value,
                title: 'Create new option: ' + internalFilterValue.value,
            })
        }
    }

    return filtered
})

/** When items change, set the value to match the internal value */
watch(
    () => props.items,
    () => setValue(internalValue.value)
)

/** When external value changes, change the internal value to match */
watch(
    () => props.modelValue,
    newValue => setValue(newValue || '')
)

/** When internal value changes, emit the preferred size change */
watch(internalValue, () => emitPreferredSize())

/** When internal filter value changes, handle it */
watch(internalFilterValue, () => emitPreferredSize())

/** When internal text value changes, update the filter value */
watch(internalTextEditorValue, newValue => handleTextChange(newValue))

/** When external filter value changes, update the internal filter value */
watch(
    () => props.filterValue,
    newValue => (internalFilterValue.value = newValue)
)

/** When selected index change, set the internal value to match */
watch(selectedIndex, () => handleSelectedIndexChange())

onMounted(() => {
    setValue(props.modelValue || '')
})

function updateInternalTextEditorValue(value: string | null): void {
    if (value || value === '') {
        internalTextEditorValue.value = value
    }
}

/** Set the value */
function setValue(newValue: string | number | boolean): void {
    selectedIndex.value = -1
    internalValue.value = newValue?.toString()
    originalValue.value = internalValue.value
    internalTextEditorValue.value = internalValue.value
    selectedIndex.value = props.items.findIndex(item => item.value === internalValue.value)
    handleSelectedIndexChange()
}

/** Get the input element from TextEditor */
function getInputElement(): HTMLElement | null {
    return editor.value?.getInputElement() || null
}

/** Calculated CSS class object for the dropdown item */
function classForItem(item: Item): Record<string, unknown> {
    const selectedItem = filteredItems.value ? filteredItems.value[selectedIndex.value] : null
    return {
        empty: !item.id,
        selected: item.id === selectedItem?.id,
        disabled: item.disabled,
        'has-icon': item.icon,
        [item.color || '']: !!item.color,
    }
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

/** Handler when user clicks away from the dropdown list */
function handleClickAway(): void {
    if (isDropdownShown.value) {
        submit()
    }
}

/** Handle mouse enter event. */
async function handleMouseEnter(event: MouseEvent, item: Item): Promise<void> {
    if (browsingTimeout.value) {
        clearTimeout(browsingTimeout.value)
    }

    browsingTimeout.value = window.setTimeout(() => {
        triggerHoverCallback(event, item)
    }, HOVER_DEBOUNCE_TIME)
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

function handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Tab') {
        submit()
    } else if (event.code !== 'Enter' && event.code !== 'Escape' && event.code !== 'NumpadEnter') {
        showDropdown()
    }

    emit('keydown', event)
}

/** Handler when item is clicked from the dropdown list */
async function handleItemClick(event: MouseEvent, item: Item): Promise<void> {
    if (event) {
        event.preventDefault()
    }

    if (item.disabled) {
        return
    }

    if (filteredItems.value) {
        internalValue.value = item.value
        selectedIndex.value = filteredItems.value.findIndex(i => i.value == item.value)
    }

    handleSelectedIndexChange()

    if (props.submitAndClose) {
        submit()
        hideDropdown()
        blur()
    }
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

/** Handler when something changed the selected dropdown item list index */
function handleSelectedIndexChange(): void {
    const items = filteredItems.value
    if (!items) {
        return
    }

    hasSubmitted.value = false

    scrollItemIntoView(selectedIndex.value)
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

/** Handle value change from the TextEditor */
function handleTextChange(value: string): void {
    if (isDropdownShown.value) {
        internalFilterValue.value = value
        hasSubmitted.value = false
        selectIndex(0)
    }

    emit('update:modelValue', value)
}

/** Submit value. */
function submit(): void {
    if (hasSubmitted.value) {
        hideDropdown()
        return
    }

    if (!filteredItems.value) {
        cancel()
        return
    }

    let item = filteredItems.value[selectedIndex.value] || internalTextEditorValue.value
    const defaultValueItem = props.items.find(item => item.value === props.defaultValue)

    if (props.strict && !filteredItems.value.length) {
        if (defaultValueItem) {
            item = defaultValueItem
        } else {
            item = props.items[0]
        }
    }

    if (props.strict && !item) {
        if (defaultValueItem) {
            item = defaultValueItem
        } else {
            item = filteredItems.value[0]
        }
    }

    if (!item && props.creatable) {
        item = {
            id: null,
            value: internalFilterValue.value,
            label: internalFilterValue.value,
        }
    }

    emit('update:modelValue', item?.value || '')
    emit('submit', item)
    hasSubmitted.value = true
    internalTextEditorValue.value = item?.value || ''
    internalFilterValue.value = ''

    blur()
    hideDropdown()
}

/** Cancel value edit. */
function cancel(): void {
    if (!filteredItems.value) {
        return
    }

    internalValue.value = originalValue.value
    selectedIndex.value = props.items.findIndex(item => item.value === internalValue.value)
    let item = props.items[selectedIndex.value]
    if (props.strict && !item) {
        item = props.items[0]
    }

    emit('update:modelValue', item?.value || '')
    emit('cancel', item)
    hasSubmitted.value = true

    internalTextEditorValue.value = item?.value || ''
    internalFilterValue.value = ''

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

.a-autocomplete-editor {
    > .dropdown {
        display: flex;
        flex-shrink: 1;
        background-color: theme.$white;
        max-height: calc(25vh);
        overflow: auto;
        z-index: 1400;

        > ul {
            flex-grow: 1;
            margin: 0;
            padding: 0;
            min-width: 0;
        }

        > ul > li {
            display: flex;
            margin: 0;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: left;
            overflow: hidden;
            height: 35px;
            color: theme.$dropdown-item-color;
            background: theme.$dropdown-item-bg;
            line-height: 35px;
            padding: 0 4px 0 4px;
            cursor: default;

            > span {
                pointer-events: none;
                text-overflow: ellipsis;
                overflow: hidden;
                flex-grow: 1;

                &.command {
                    flex-shrink: 0;
                    flex-grow: 0;
                }
            }

            &.empty {
                font-style: italic;
                color: theme.$dropdown-item-empty-color;
            }

            &.new {
                > .command {
                    font-style: italic;
                    color: theme.$dropdown-item-new-color;
                }

                > .value {
                    padding-right: 0;
                }
            }

            &:nth-child(2n) {
                background: theme.$dropdown-item-even-bg;
            }

            &.selected {
                background: theme.$dropdown-item-selected-bg;
                color: theme.$dropdown-item-selected-color;
            }

            &:hover {
                background: theme.$dropdown-item-bg-hover;
                color: theme.$dropdown-item-color-hover;
            }

            &.selected:hover {
                background: theme.$dropdown-item-selected-bg-hover;
                color: theme.$dropdown-item-selected-color-hover;
            }

            &.has-icon {
                > .icon {
                    flex-shrink: 0;
                    flex-grow: 0;
                    font-family: 'Font Awesome 5 Free';
                    font-weight: 900;
                    font-size: 14px;
                    content: attr(data-icon);
                    align-self: center;
                    padding-right: 0.325em;
                    padding-left: 0.325em;
                }
            }

            &.selected.has-icon {
                > .icon {
                    color: theme.$dropdown-item-selected-icon-color;
                }
            }

            // Listitem colors
            &.danger {
                cursor: help;

                .notice {
                    display: inline-flex;
                    flex-shrink: 0;
                    flex-grow: 0;
                    padding-right: 4px;
                    padding-left: 4px;
                    align-self: center;
                    color: theme.$dropdown-item-danger-bg;
                }

                //background: theme.$dropdown-item-danger-bg;
                //color: theme.$dropdown-item-danger-color;

                &.has-icon {
                    > .icon {
                        color: theme.$dropdown-item-danger-bg;
                    }
                }

                &.selected {
                    background: theme.$dropdown-item-danger-selected-bg;
                    color: theme.$dropdown-item-danger-selected-color;
                }

                &.selected:hover {
                    background: theme.$dropdown-item-danger-selected-bg-hover;
                    color: theme.$dropdown-item-danger-selected-color-hover;
                }
            }

            &.success {
                background: theme.$dropdown-item-success-bg;
                color: theme.$dropdown-item-success-color;

                &.has-icon {
                    > .icon {
                        color: theme.$dropdown-item-success-icon-color;
                    }
                }

                &.selected {
                    background: theme.$dropdown-item-success-selected-bg;
                    color: theme.$dropdown-item-success-selected-color;
                }

                &:hover {
                    background: theme.$dropdown-item-success-bg-hover;
                    color: theme.$dropdown-item-success-color-hover;
                }

                &.selected:hover {
                    background: theme.$dropdown-item-success-selected-bg-hover;
                    color: theme.$dropdown-item-success-selected-color-hover;
                }
            }

            &.disabled,
            &:disabled {
                cursor: not-allowed;
                opacity: 0.6;
                > .value {
                    text-decoration-line: line-through;
                }
            }
        }
    }
}
</style>
