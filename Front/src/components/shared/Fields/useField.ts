import type { CrudFormField, FieldValidatorFunction } from 'layout/components/CrudFormEditor/types'
import type { ValidationError } from './ValidationErrors'
import type { ComputedRef, Ref } from 'vue'
import { ref, computed, useSlots, nextTick } from 'vue'
import type { FieldRequiredFunction } from '../CrudFormEditor/CrudFormEditor'
import type { DateObject, DropdownItem } from './types'
import type { Item as AutocompleteItem } from 'layout/components/ValueEditors/useSelectEditor'
import { defaultRichTextTableStyles } from '../ValueEditors/richTextTableConstants'

export interface Classes {
    fullwidth?: boolean
    invalid?: boolean
    'has-icon'?: boolean
    'no-label'?: boolean
    'col-span-1'?: boolean
    'col-span-2'?: boolean
    'col-span-3'?: boolean
    'col-span-4'?: boolean
    'col-span-5'?: boolean
    'col-span-6'?: boolean
    'col-span-7'?: boolean
    'col-span-8'?: boolean
}

export interface Emits {
    (e: 'update:modelValue', value: FieldValue | null): void
    (e: 'blur', event: FocusEvent): void
    (e: 'focus', event: FocusEvent): void
    (e: 'change:valid', isValid: boolean): void
}

export type FieldValue =
    | string
    | number
    | boolean
    | DateObject
    | Record<string, unknown>
    | unknown[]
    | DateObject
    | Date

export interface FieldProps {
    /** Field this editor is editing (overrides props) */
    field?: CrudFormField | null
    /** Parent object from which this editor is editing the field */
    parentObject?: Record<string, unknown> | null
    /** Initial value of the field */
    modelValue?: FieldValue | null
    trueValue?: FieldValue | null
    falseValue?: FieldValue | null
    /** Initial default value of the field */
    defaultValue?: FieldValue | null
    /** Label for the field */
    label?: string
    /** Max length for this value, if any */
    maxLength?: number
    /** Rounds number to meaningful digits */
    roundNumber?: number
    /** Set to false to prevent any formatting on numeric fields */
    format?: boolean
    /** Set true to remove label element from element */
    noLabelElement?: boolean
    /** Icon for the field */
    icon?: string
    /** Tooltip on hover */
    tooltip?: string
    /** Label icon to prepend to label */
    labelIcon?: string
    /** If this field is loading */
    loading?: boolean | FieldRequiredFunction
    /** True if the field is required */
    required?: boolean | FieldRequiredFunction
    /** True if the field is disabled */
    disabled?: boolean | FieldRequiredFunction
    /** True if the field is clearable (user is able to set it to null) */
    clearable?: boolean
    /** True if the field value is highlighted (selected) on focus */
    selectOnFocus?: boolean
    /** Placeholder prop if field placeholder is not defined */
    placeholder?: string
    /** Column span on form layout */
    colSpan?: number
    /** Optional message to show */
    message?: string | Record<string, boolean>
    /** Validators to run this field against to check the value validity */
    validators?: FieldValidatorFunction[]
    /** True if handleChange should fire whenever the model value updates, not only on submit */
    updateOnChange?: boolean
}

export const defaultFieldProps = {
    field: null,
    modelValue: null,
    format: false,
    noLabelElement: false,
    loading: false,
    disabled: false,
    clearable: false,
    selectOnFocus: false,
    required: false,
    placeholder: '',
    validators: () => [],
    canHaveImages: false,
    canHaveTables: false,
    tableStyles: defaultRichTextTableStyles,
    updateOnChange: false,
}

export interface UsesField {
    internalValue: Ref<FieldValue | null>
    originalValue: Ref<FieldValue | null>
    validate(): Promise<void>
    computedField: ComputedRef<FieldProps & CrudFormField>
    fieldProps?: ComputedRef<Record<string, unknown>>
    handleBlur(event: FocusEvent): void
    handleFocus(event: FocusEvent): void
    isDisabled: ComputedRef<boolean>
    isLoading: ComputedRef<boolean>
    hasIcon: ComputedRef<boolean>
    isClearable: ComputedRef<boolean>
    hasTitle: ComputedRef<boolean>
    computedLabel: ComputedRef<string | null>
    computedDefaultValue: ComputedRef<FieldValue | null>
    computedKeyProperty: ComputedRef<string>
    computedLabelProperty: ComputedRef<string>
    allValidators: ComputedRef<FieldValidatorFunction[]>
    validatorCount: ComputedRef<number>
    allItems: ComputedRef<DropdownItem[]>
    autocompleteItems: ComputedRef<AutocompleteItem[]>
    handleChange(value: FieldValue | null): Promise<void>
    handleInput(value: FieldValue | null): Promise<void>
    clearValue(): void
    isValid: ComputedRef<boolean>
    validationErrors: Ref<ValidationError[]>
}

export function useField(props: FieldProps, emit: Emits): UsesField {
    const slots = useSlots()

    /** Current internal value for the editor */
    const internalValue = ref<FieldValue | null>(null)
    /** Original value before internal changes for the editor */
    const originalValue = ref<FieldValue | null>(null)
    /** Are we currently validating data */
    const isValidating = ref<Promise<void> | null>(null)
    /** List of validation errors we got last time we run validations */
    const validationErrors = ref<ValidationError[]>([])

    /**
     * Compute field object based on $props and $props.field.
     * Setting field values always override the default or template set $props values.
     */
    const computedField = computed<FieldProps & CrudFormField>(() => {
        // Build the field object. First take all the props with their default values,
        // and then override them with field object values if any are set.
        return {
            ...props,
            ...(props.field || {}),
        }
    })

    /** Generates necessary props for AibidiaField component */
    const fieldProps = computed<Record<string, unknown>>(() => {
        const helperProps = props.field?.helperContent?.helperProps
        return {
            class: computedClass.value,
            noLabelElement: computedNoLabelElement.value,
            label: computedLabel.value,
            labelIcon: computedLabelIcon.value,
            labelIconCallback: computedField.value?.labelIconCallback,
            title: computedTooltip.value,
            defaultValue: computedDefaultValue.value,
            isValid: isValid.value,
            isRequired: isRequired.value,
            messages: formattedMessage.value,
            helperComponent: computedField.value?.helperContent?.helperComponent,
            helperProps: typeof helperProps === 'object' ? helperProps : {},
        }
    })

    /** True if the column should extend to all columns */
    const isFullWidth = computed<boolean>(() => !!computedField.value?.fullWidth)
    /** How many columns this field should span */
    const columnSpan = computed<number | null>(() => computedField.value?.colSpan || null)
    /** True if this field has icon */
    const hasIcon = computed<boolean>(() => !!slots.icon || !!computedField.value?.icon)
    /** True if this field has title (such as checkbox editor) */
    const hasTitle = computed<boolean>(() => !!slots.default || !!computedField.value?.title)
    // For label, the slot overrides the field label
    const noLabel = computed<boolean>(() => !!(slots.label || computedField.value?.label))
    /** True if this field is disabled */
    const isDisabled = computed<boolean>(() => {
        if (computedField.value?.disabled === true) {
            return true
        }

        if (typeof computedField.value?.disabled === 'function') {
            return computedField.value?.disabled()
        }

        return false
    })

    /** Computed required state */
    const isRequired = computed<boolean>(() => {
        if (computedField.value?.required === true) {
            return true
        }

        if (typeof computedField.value?.required === 'function') {
            return computedField.value?.required()
        }

        return false
    })

    /** True if this field is clearable */
    const isClearable = computed<boolean>(() => computedField.value?.clearable === true)

    /** True if this field is loading */
    const isLoading = computed<boolean>(() => {
        if (computedField.value?.loading === true) {
            return true
        }

        if (typeof computedField.value?.loading === 'function') {
            return computedField.value?.loading()
        }

        return false
    })

    const computedLabel = computed<string | null>(() => computedField.value?.label || null)

    /** Computed noLabelElement setting */
    const computedNoLabelElement = computed<boolean | undefined>(
        () => computedField.value?.noLabelElement
    )

    /** Computed label icon to display */
    const computedLabelIcon = computed<string | null>(() => computedField.value?.labelIcon || null)

    /** Computed classes for this field */
    const computedClass = computed<Classes>(() => {
        const classes: Classes = {
            fullwidth: isFullWidth.value,
        }

        if (columnSpan.value && columnSpan.value > 1) {
            const key: keyof Classes = ('col-span-' + columnSpan.value) as keyof Classes
            classes[key] = true
        }

        if (hasIcon.value) {
            classes['has-icon'] = true
        }

        if (!noLabel.value) {
            classes['no-label'] = true
        }

        if (!isValid.value) {
            classes['invalid'] = true
        }

        return classes
    })

    /** True if this field value is currently valid */
    const isValid = computed<boolean>(() => validationErrors.value.length == 0)

    /** Formatted messages */
    const formattedMessage = computed<string[]>(() => {
        const messages = []

        if (typeof props.message === 'string') {
            messages.push(props.message)
        } else {
            if (Array.isArray(props.message)) {
                props.message.forEach(message => {
                    if (typeof message === 'string') {
                        messages.push(message)
                    } else {
                        for (const key in message) {
                            if (message[key]) {
                                messages.push(key)
                            }
                        }
                    }
                })
            } else {
                for (const key in props.message) {
                    if (props.message[key]) {
                        messages.push(key)
                    }
                }
            }
        }

        if (validationErrors.value.length) {
            // add all validation messages from this editor
            validationErrors.value.forEach(err => {
                messages.push(err.message)
            })
        }

        return messages.filter(m => {
            if (m) {
                return m
            }
        })
    })

    /** Tooltip for the field. Defaults to value */
    const computedTooltip = computed<string>(() => {
        if (computedField.value?.tooltip) {
            return computedField.value?.tooltip
        }

        return (props.modelValue as string) || ''
    })

    /** Computed default value */
    const computedDefaultValue = computed<FieldValue | null>(
        () => computedField.value?.defaultValue || null
    )

    /** All validators to be run against. Prop + field + editor = all */
    const allValidators = computed<FieldValidatorFunction[]>(() => {
        const validators = [
            ...(computedField.value?.validators || []),
            ...(editorValidators.value || []),
        ]

        return validators
    })

    /** Count of validator functions */
    const validatorCount = computed<number>(() => allValidators.value?.length || 0)

    /** Editor validators to be added to list of all validators */
    const editorValidators = computed<FieldValidatorFunction[]>(() => [])

    /** Key to use as id of item */
    const computedKeyProperty = computed<string>(() => computedField.value.keyProperty || 'Id')
    /** Key to use as label of item */
    const computedLabelProperty = computed<string>(
        () => computedField.value.labelProperty || 'Name'
    )

    /** Items from either prop or field */
    const allItems = computed<DropdownItem[]>(() => computedField.value.items || [])

    /** Items for Autocomplete Dropdown */
    const autocompleteItems = computed<AutocompleteItem[]>(() => {
        const items = allItems.value || []

        const result: AutocompleteItem[] = []

        if (computedField.value.clearable || props.clearable) {
            result.push({
                id: null,
                label: 'Empty',
                value: '',
                title: 'Clear field by selecting this item',
            })
        }

        let id = 0
        items.forEach(item => {
            if (typeof item === 'string') {
                result.push({
                    id: item,
                    value: item,
                    label: item,
                })

                id = id + 1
                return
            }

            const key = computedKeyProperty.value !== null ? item[computedKeyProperty.value] : id
            if (key === undefined || typeof key === 'boolean') {
                console.warn(
                    `Select field item has undefined key. Tried to access: ${computedKeyProperty.value}`
                )

                return
            }

            const label =
                computedLabelProperty.value !== null
                    ? (item[computedLabelProperty.value] as string)
                    : key

            if (label === null || label === undefined) {
                console.warn(
                    `Select field item is missing a label. Tried to access: ${computedLabelProperty.value}`
                )

                return
            }

            const isDisabled =
                typeof item['disabled'] === 'boolean' ? (item['disabled'] as boolean) : false

            result.push({
                id: key,
                value: label.toString(),
                label: label.toString(),
                disabled: isDisabled,
            })

            id = id + 1
        })

        return result
    })

    /** Handles input from the value editor */
    async function handleInput(value: FieldValue | null): Promise<void> {
        if (props.disabled || isValidating.value) {
            return
        }

        await validate()

        if (isValid.value) {
            setParentField(value)
            emit('update:modelValue', value)
        }
    }

    /** Sets parent field data to value */
    function setParentField(value: FieldValue | null): void {
        if (props.disabled) {
            return
        }

        /** Burn the value to the parent object field */
        const object = props.parentObject
        if (
            object !== null &&
            object !== undefined &&
            typeof computedField.value?.data !== 'undefined'
        ) {
            object[computedField.value?.data] = value
        }
    }

    /** Handles change from the value editor */
    async function handleChange(value: FieldValue | null): Promise<void> {
        if (props.disabled || internalValue.value === value) {
            return
        }

        internalValue.value = value
        await handleInput(value)
    }

    /** Clears value programmatically */
    function clearValue(): void {
        handleChange(null)
    }

    /** Handle when input blurs */
    function handleBlur(event: FocusEvent): void {
        emit('blur', event)
    }

    /** Handle when input focuses */
    function handleFocus(event: FocusEvent): void {
        emit('focus', event)
    }

    /** Validates the field asynchronously. Populates validationErrors. */
    async function validate(): Promise<void> {
        // Wait until the previous validator is completed and then continue with the next validator.
        if (isValidating.value) {
            await isValidating.value
        }

        isValidating.value = new Promise(resolve => {
            const errors: ValidationError[] = []
            const validationPromises: Promise<void>[] = []

            allValidators.value?.forEach(validator => {
                const p = new Promise<void>((resolve, reject) => {
                    return validator(
                        internalValue.value,
                        props.parentObject || null,
                        computedField.value || null
                    )
                        .then(() => {
                            return resolve()
                        })
                        .catch((err: Error) => {
                            return reject(err)
                        })
                })

                p.catch(err => {
                    errors.push(err)
                })

                validationPromises.push(p)
            })

            return Promise.all(validationPromises)
                .then(() => {
                    validationErrors.value = errors
                    return resolve()
                })
                .catch(err => {
                    if (errors.indexOf(err) < 0) {
                        errors.push(err)
                    }

                    validationErrors.value = errors
                    return resolve()
                })
        })

        await isValidating.value
        await nextTick()
        emit('change:valid', isValid.value)
        isValidating.value = null
    }

    return {
        internalValue,
        originalValue,
        computedField,
        isDisabled,
        isLoading,
        hasIcon,
        hasTitle,
        isClearable,
        computedLabel,
        computedDefaultValue,
        computedKeyProperty,
        computedLabelProperty,
        autocompleteItems,
        allItems,
        allValidators,
        validatorCount,
        fieldProps,
        validate,
        handleBlur,
        handleFocus,
        handleChange,
        handleInput,
        clearValue,
        isValid,
        validationErrors,
    }
}
