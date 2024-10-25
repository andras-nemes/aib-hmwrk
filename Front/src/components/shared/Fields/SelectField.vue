<template>
    <FieldLayout
        v-bind="fieldProps"
        class="select-field"
    >
        <AutocompleteEditor
            class="a-control"
            :class="{'has-icon': hasIcon, 'is-loading': isLoading}"
            submit-and-close
            single-row
            updown-selects
            strict
            :placeholder="computedField.placeholder"
            :items="autocompleteItems"
            :show-counter="false"
            :allow-new-lines="false"
            :select-on-focus="selectOnFocus"
            :disabled="isDisabled"
            :creatable="false"
            :model-value="isLoading ? '' : autocompleteValue"
            @submit="handleSelectChange"
            @cancel="handleSelectChange"
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
        </AutocompleteEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import type { Item as AutocompleteItem } from 'components/shared/ValueEditors/useSelectEditor'
import AutocompleteEditor from 'components/shared/ValueEditors/AutocompleteEditor.vue'
import type { DropdownItems } from './types'
import { ref, onMounted, watch } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'

interface Props extends FieldProps {
    /** Override value to match this field requirements */
    modelValue?: string | number | null
    /** When mapping items, use this property as key */
    keyProperty?: string
    /** When building list of items, use this property from item as label */
    labelProperty?: string
    /** Items for Autocomplete Dropdown */
    items?: DropdownItems
    /** Setting true will shows empty item as first item in the dropdown list and allows user to clear the value. */
    clearable?: boolean
    /** If text should be selected on focus */
    selectOnFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    modelValue: null,
    keyProperty: 'Id',
    labelProperty: 'Name',
    items: () => [],
    clearable: false,
    selectOnFocus: false,
})

const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    isLoading,
    hasIcon,
    computedKeyProperty,
    computedLabelProperty,
    autocompleteItems,
    allItems,
    fieldProps,
    handleBlur,
    handleFocus,
    handleChange,
    allValidators,
    validatorCount,
    isValid,
    validate,
    validationErrors,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

/** Current value for the autocomplete field */
const autocompleteValue = ref<string | boolean | number | null>(null)

watch(
    () => props.items,
    () => setValue()
)

watch(
    () => props.modelValue,
    () => setValue()
)

watch(
    () => props.keyProperty,
    () => setValue()
)

watch(
    () => props.labelProperty,
    () => setValue()
)

/** When the validators object is reassigned, run the validation pipeline */
watch(allValidators, async () => await validate())
/** When the number of validators change, run the validation pipeline */
watch(validatorCount, async () => await validate())

onMounted(async () => {
    originalValue.value = props.modelValue || null
    internalValue.value = props.modelValue || null
    setValue()
    await validate()
})

/** Helper to set initial value for the dropdown */
function setValue(): void {
    let setValue = props.modelValue as string | boolean | number | null
    if (computedKeyProperty.value && allItems.value) {
        const item =
            allItems.value.find(item => {
                if (typeof item === 'string') {
                    return item === setValue
                }

                return item[computedKeyProperty.value] === setValue
            }) || null

        if (typeof item === 'string') {
            setValue = item
        } else {
            setValue = item
                ? item[computedLabelProperty.value || computedKeyProperty.value] || null
                : null
        }
    }

    autocompleteValue.value = setValue
    internalValue.value = props.modelValue
}

/** Handler when the autocomplete changes */
async function handleSelectChange(value: AutocompleteItem): Promise<void> {
    if (value?.id === internalValue.value) {
        return
    }

    handleChange(value?.id || null)
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

ai-field.select-field {
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
            padding-top: calc(0.375em - 1px);
            flex-grow: 1;
            font-size: 1em;
            max-width: 100%;
            outline: none;
            cursor: pointer;

            // Reserve room for dropdown arrow
            padding-right: 2.5em;
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

        &.has-icon {
            > input {
                padding-left: 2rem;
            }
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
            &::after {
                position: absolute;
                display: block;
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
