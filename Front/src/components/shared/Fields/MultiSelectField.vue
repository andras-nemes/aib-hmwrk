<template>
    <FieldLayout
        v-bind="fieldProps"
        class="multiselect-field"
    >
        <MultiselectEditor
            ref="editor"
            class="a-control"
            :class="{'has-icon': hasIcon, 'is-loading': (isLoading && showLoader)}"
            submit-and-close
            single-row
            updown-selects
            strict
            :placeholder="computedField.placeholder"
            :items="autocompleteItems"
            :show-counter="false"
            :allow-new-lines="false"
            :disabled="isDisabled"
            :creatable="false"
            :model-value="isLoading ? '' : autocompleteValue"
            :has-select-all="hasSelectAll"
            @submit="handleMultiSelectChange"
            @blur="handleBlur"
            @focus="handleFocus"
        >
            <template
                v-if="hasIcon"
                #before
            >
                <span class="icon is-left">
                    <slot name="icon">
                        <i :class="computedField.icon" />
                    </slot>
                </span>
            </template>
            <template
                v-if="allItems.length === 0"
                #noitems
            >
                <li class="empty">
                    {{ noItemsText }}
                </li>
            </template>
            <template #noresults>
                <li class="empty">
                    {{ noResultsText }}
                </li>
            </template>
        </MultiselectEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import MultiselectEditor from 'components/shared/ValueEditors/MultiselectEditor.vue'
import type { DropdownItems } from './types'
import { ref, onMounted, watch } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'

export type MultiSelectValueArray = Array<string | number>

interface Props extends FieldProps {
    /** Override value to match this field requirements */
    modelValue?: MultiSelectValueArray | string | null
    /** When mapping items, use this property as key */
    keyProperty?: string
    /** When building list of items, use this property from item as label */
    labelProperty?: string
    /** Items for Autocomplete Dropdown */
    items?: DropdownItems | null
    /** Setting true will report value as Array of items from items instead of semicolon separated value list */
    valueAsArray?: boolean
    /** Setting true will shows empty item as first item in the dropdown list and allows user to clear the value. */
    clearable?: boolean
    /** Text to show when there are no items */
    noItemsText?: string
    /** Text to show when the search did not match any */
    noResultsText?: string
    /** Should multiselect has the Select All option */
    hasSelectAll?: boolean
    /** Whether to show loader when loading */
    showLoader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    modelValue: null,
    keyProperty: 'Id',
    labelProperty: 'Name',
    items: null,
    valueAsArray: true,
    clearable: false,
    noItemsText: 'No items',
    noResultsText: 'No results',
    hasSelectAll: true,
    showLoader: true,
})

const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    isLoading,
    computedKeyProperty,
    computedLabelProperty,
    autocompleteItems,
    allItems,
    hasIcon,
    fieldProps,
    handleBlur,
    handleFocus,
    handleChange,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

/** Current value for the autocomplete field */
const autocompleteValue = ref<string | number | null>(null)
/** Current value for tooltip */
const tooltipValue = ref<string>('')

/** If list of dropdown items has changed, set the value */
watch(
    () => props.items,
    () => setValue()
)

/** If the external value has changed, set the value */
watch(
    () => props.modelValue,
    () => setValue()
)

/** If the property which maps items to keys has changed, set the value */
watch(computedKeyProperty, () => setValue())
/** If the property which maps items to labels has changed, set the value */
watch(computedLabelProperty, () => setValue())
/** When the validators object is reassigned, run the validation pipeline */
watch(allValidators, async () => await validate())
/** When the number of validators change, run the validation pipeline */
watch(validatorCount, async () => await validate())

/** When mounting, set the value and validate it */
onMounted(async () => {
    originalValue.value = props.modelValue || null
    internalValue.value = props.modelValue || null
    setValue()
    await validate()
})

/**
 * Helper to set initial value for the dropdown.
 * This also computes the tooltip which shows checked values.
 */
function setValue(): void {
    if (typeof props.modelValue === 'string') {
        // If the value is already a string, we assume it is semicolon separated string,
        // and just pass the string directly to MultiSelectEditor
        autocompleteValue.value = props.modelValue
        internalValue.value = props.modelValue
    } else if (Array.isArray(props.modelValue) || props.modelValue == null) {
        // If the value is an array, then we will build the semicolon separated string the MultiSelectEditor is expecting
        let multiselectValue = ''
        let tooltip = ''
        const itemList = (props.modelValue || []) as Array<string | number>
        // Convert user value array to MultiSelect value semicolon separated string
        if (itemList && itemList.length) {
            itemList.forEach((key: string | number, idx: number) => {
                if (key) {
                    const item = autocompleteItems.value.find(v => v.id == key)
                    let value = item?.value || key

                    // Make sure key does not have any unescaped double quotes
                    value = value.toString().replace(/"/g, '\\"')

                    // If key has a separator or double quote, we will enclose it to quotes
                    if (value.indexOf(';') > -1 || value.indexOf('"') > -1) {
                        value = `"${value}"`
                    }

                    multiselectValue += `${idx > 0 ? ' ' : ''}${value};`
                    tooltip += `✓ ${item?.label || item?.value || key}\n`
                }
            })
        }

        tooltipValue.value = tooltip
        autocompleteValue.value = multiselectValue
        internalValue.value = multiselectValue
    }
}

/** Handler when the multiselect changes */
async function handleMultiSelectChange(
    value: string | number | boolean,
    selectedItems: string[]
): Promise<void> {
    // We get value as semicolon separated string from MultiselectEditor
    // If that is what we want, just emit the value
    if (!props.valueAsArray) {
        return handleChange(value || null)
    } else {
        // Convert MultiSelect value array to whatever the user of field is expecting
        // and update tooltip value
        const items: MultiSelectValueArray = []
        selectedItems.forEach((value: string | number) => {
            if (value) {
                const item = autocompleteItems.value.find(v => v.value === value)

                let id = item?.id || value
                items.push(id)
            }
        })

        return handleChange(items)
    }
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

ai-field.multiselect-field {
    > .value > ai-field-editor {
        display: inline-flex;
        align-items: baseline;
        justify-content: center;
        box-sizing: border-box;

        clear: both;
        position: relative;
        text-align: left;
        max-width: 100%;
        vertical-align: top;

        background: theme.$control-bg;
        color: theme.$control-color;
        box-shadow: theme.$control-box-shadow;
        border: theme.$control-border;
        border-radius: theme.$control-border-radius;
        cursor: pointer;

        > input {
            display: block;
            border-radius: theme.$control-border-radius;
            font-size: 0.75rem;
            padding: 0;
            padding-bottom: calc(0.375em - 1px);
            padding-left: calc(0.625em - 1px);
            padding-right: 2em;
            padding-top: calc(0.375em - 1px);
            flex-grow: 1;
            font-size: 1em;
            max-width: 100%;
            outline: none;
            cursor: pointer;

            text-overflow: ellipsis;

            &.disabled,
            &[disabled] {
                background-color: theme.$control-bg-disabled;
                border-color: theme.$control-border-color-disabled;
                color: theme.$control-color-disabled;
                opacity: 0.6;
                cursor: not-allowed;
            }
        }

        // By default, the checkbox fields are aligned to flex-end, so let's align them to center
        ai-field.checkbox-field {
            > .value > ai-field-editor {
                align-items: center;
                margin-right: 0.325em;
            }
        }

        &.has-icon {
            > input {
                padding-left: 2rem;
            }
        }

        .more {
            display: inline-flex;
            flex-shrink: 0;
            padding-right: 2rem;
            pointer-events: none;
        }

        > .icon.is-left {
            display: inline-flex;
            position: absolute;
            align-items: center;
            justify-content: center;
            left: calc(0.625em - 1px);
            top: 0px;
            bottom: 0;
            color: theme.$control-icon-color;
            pointer-events: none;
            width: 1.5em;
            z-index: 4;
            flex-shrink: 0;
        }

        // Dropdown arrow
        &:after {
            display: block;
            border: 3px solid transparent;
            border-left-width: 2px;
            border-bottom-width: 2px;
            border-radius: 0;
            right: 1.1em;
            border-color: theme.$control-dropdown-color;
            border-right: 0;
            border-top: 0;
            content: ' ';
            width: 0.5em;
            height: 0.5em;
            margin-top: -0.5em;
            pointer-events: none;
            position: absolute;
            top: 50%;
            transform: rotate(-45deg);
            transform-origin: center;
        }

        &.has-dropdown {
            > input {
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
                border-bottom-color: transparent;
            }

            > .dropdown {
                border: theme.$control-border;
                border-top-left-radius: 0;
                border-top-right-radius: 0;
                border-top-width: 0;
            }
        }

        &:hover::after {
            border-color: theme.$control-dropdown-color-hover;
        }

        &:hover {
            border-color: theme.$control-border-color-hover;

            &.has-dropdown {
                border-bottom-color: transparent;
            }

            > .icon.is-left {
                color: theme.$control-icon-color-hover;
            }

            > .dropdown {
                border-color: theme.$control-border-color-hover;
                border-top-width: 0;
            }
        }

        &:focus-within {
            border-color: theme.$control-border-color-focus;
            box-shadow: theme.$control-box-shadow-focus;

            > .dropdown {
                border-color: theme.$control-border-color-focus;
                border-top-width: 0;
            }
        }

        &.has-dropdown {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-bottom-color: transparent;
        }

        &.is-loading {
            pointer-events: none;
            padding-right: 1em;

            &::after {
                position: absolute;
                display: block;
                top: 1em;
                animation: spinAround 500ms infinite linear;
                border: 2px solid theme.$control-dropdown-color;
                border-radius: 290486px;
                border-right-color: transparent;
                border-top-color: transparent;
                content: '';
                height: 1em;
                width: 1em;
            }
        }
    }

    &.invalid {
        ai-field-editor {
            border-color: theme.$control-border-color-invalid;

            &:focus-within {
                box-shadow: theme.$control-box-shadow-invalid-focus;
            }
        }
    }
}

@keyframes spinAround {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(359deg);
    }
}
</style>
