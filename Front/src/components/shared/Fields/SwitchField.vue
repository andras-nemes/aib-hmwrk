<template>
    <FieldLayout
        v-bind="fieldProps"
        class="switch-field"
    >
        <CheckboxEditor
            :model-value="Boolean(internalValue)"
            :class="{'has-icon': hasIcon}"
            :disabled="isDisabled"
            @blur="handleBlur"
            @focus="handleFocus"
        >
            <template #before>
                <slot name="before">
                    <span
                        :class="{'is-active': internalValue == false}"
                        @click="handleChange(false)"
                    >{{ computedField.beforeLabel }}</span>
                </slot>
                <span
                    v-if="hasIcon"
                    class="icon is-left"
                >
                    <slot name="icon">
                        <i :class="computedField.icon" />
                    </slot>
                </span>
            </template>
            <template #checkbox>
                <span
                    class="check is-success"
                    @click.stop="handleChange(!internalValue)"
                />
            </template>
            <template #after>
                <slot name="after">
                    <span
                        :class="{'is-active': internalValue == true}"
                        @click="handleChange(true)"
                    >{{ computedField.afterLabel }}</span>
                </slot>
            </template>
        </CheckboxEditor>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { computed, watch, onMounted } from 'vue'
import CheckboxEditor from 'components/shared/ValueEditors/CheckboxEditor.vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits, FieldValue } from './useField'

interface Props extends FieldProps {
    /** Instead of boolean "True", emit this value as the true value */
    trueValue?: FieldValue
    /** Instead of boolean "False", emit this value as the true value */
    falseValue?: FieldValue
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    trueValue: true,
    falseValue: false,
})

const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isDisabled,
    hasIcon,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
    handleBlur,
    handleFocus,
    handleInput,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

/** Helper to pick trueValue from computedField */
const computedTrueValue = computed<FieldValue | null>(
    () => computedField.value?.trueValue as FieldValue
)

/** Helper to pick falseValue from computedField */
const computedFalseValue = computed<FieldValue | null>(
    () => computedField.value?.falseValue as FieldValue
)

watch(
    () => props.modelValue,
    async newVal => {
        originalValue.value = newVal
        internalValue.value = newVal
        await validate()
        setInternalValue(newVal)
    }
)

/** When the validators object is reassigned, run the validation pipeline */
watch(allValidators, async () => await validate())
/** When the number of validators change, run the validation pipeline */
watch(validatorCount, async () => await validate())

onMounted(async () => {
    originalValue.value = props.modelValue || null
    internalValue.value = props.modelValue || null
    setInternalValue(props.modelValue)
    await validate()
})

/** Set internal value (boolean) to either trueValue or falseValue */
function setInternalValue(value: FieldValue | null): void {
    if (value === computedTrueValue.value) {
        internalValue.value = true
    } else {
        internalValue.value = false
    }
}

/** Handler when the input submits changes */
function handleChange(value: FieldValue | null): void {
    if (props.disabled && internalValue.value === value) {
        return
    }

    internalValue.value = value

    if (internalValue.value === true) {
        handleInput(computedTrueValue.value)
    } else {
        handleInput(computedFalseValue.value)
    }
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

ai-field.switch-field {
    ai-field-editor {
        > span:not(.check) {
            &:not(:first-child) {
                margin-left: calc(0.325em + 2px);
            }

            &:not(:last-child) {
                margin-right: calc(0.325em + 2px);
            }
        }

        > span.is-active {
            font-weight: 700;
        }

        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        box-sizing: border-box;

        clear: both;
        position: relative;
        text-align: left;
        max-width: 100%;
        vertical-align: top;
        user-select: none;

        color: theme.$default-text-color;
        padding-top: 0.325em;

        > input[type='checkbox'] {
            position: absolute;
            left: 0;
            opacity: 0;
            outline: none;
            z-index: -1;
        }

        > span.check {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            width: 2.75em;
            height: 1.575em;
            padding: 0.2em;
            background: theme.$grey-lighter;
            transition: background 150ms ease-out, box-shadow 150ms ease-out;
            cursor: pointer;

            border-width: 0;
            border-radius: 290486px;
            box-sizing: border-box;

            &:before {
                content: '';
                display: block;
                border-radius: 3px;
                width: 1.175em;
                height: 1.175em;
                background: theme.$white;
                box-shadow: theme.$shadow-xs;
                border-radius: 290486px;
                transition: transform 150ms ease-out;
                will-change: transform;
                transform-origin: left;
            }
        }

        input[type='checkbox'] + span.check {
            background: theme.$control-bg-inactive;
        }

        input[type='checkbox']:checked + span.check {
            background: theme.$control-bg-active;
        }

        input[type='checkbox']:checked + span.check:before {
            transform: translate3d(100%, 0, 0);
        }

        input[type='checkbox']:focus + span.check,
        input[type='checkbox']:active + span.check {
            box-shadow: 0 0 0.5em theme.$control-bg-inactive-hover;
        }

        input[type='checkbox']:focus:checked + span.check,
        input[type='checkbox']:active:checked + span.check {
            box-shadow: 0 0 0.5em theme.$control-bg-active-hover;
        }

        &:hover input[type='checkbox'] + span.check {
            background: theme.$control-bg-inactive-hover;
        }

        &:hover input[type='checkbox']:checked + span.check {
            background: theme.$control-bg-active-hover;
        }

        &.has-icon {
            padding-left: 2rem;
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

        input[disabled] + span.check {
            cursor: not-allowed;
        }
    }
}
</style>
