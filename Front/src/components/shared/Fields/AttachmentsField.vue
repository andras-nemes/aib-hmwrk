<template>
    <FieldLayout
        v-bind="fieldProps"
        class="attachments-field"
        :class="{ 'is-loading': isLoading }"
    >
        <template #value>
            <PageLayout class="value attachments-field">
                <PageLayout 
                    v-if="modelValue && modelValue.length > 0" 
                    class="value file-links"
                >
                    <span
                        v-for="(attachment, rowIdx) in modelValue"
                        :key="rowIdx"
                        :class="{ link: !!computedField.action }"
                        :title="String(attachment[labelProperty])"
                        @click="event => handleAttachmentClick(event, attachment)"
                    >
                        {{ attachment[labelProperty] }}
                    </span>
                </PageLayout>
                <p 
                    v-else 
                    class="value"
                > 
                    &ndash; 
                </p>
                <span class="loader" />
            </PageLayout>
        </template>
    </FieldLayout>
</template>

<script setup lang="ts">
import { FieldLayout } from 'components/shared/Form'
import { watch, onMounted } from 'vue'
import { useField, defaultFieldProps } from './useField'
import type { FieldProps, Emits } from './useField'
import PageLayout from '../PageLayout/PageLayout.vue'

interface Props extends FieldProps {
    /** Override value to match this field requirements */
    modelValue?: Record<string, unknown>[]
    /** What key to use as id from items in array */
    keyProperty?: string
    /** What key to use as label from items in array */
    labelProperty?: string
}

const props = withDefaults(defineProps<Props>(), {
    ...defaultFieldProps,
    modelValue: () => [],
    keyProperty: 'Id',
    labelProperty: 'FileName',
})

const emit = defineEmits<Emits>()

const {
    internalValue,
    originalValue,
    computedField,
    isLoading,
    fieldProps,
    allValidators,
    validatorCount,
    isValid,
    validationErrors,
    validate,
} = useField(props, emit)

defineExpose({ ...props, validate, isValid, validationErrors })

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

/** Helper which forwards attachment click to action handler */
function handleAttachmentClick(event: Event, attachment: Record<string, unknown>): void {
    if (!computedField.value?.action) {
        return
    }

    return computedField.value.action(event, props.parentObject || null, attachment)
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
ai-field.attachments-field {
    .value.attachments-field {
        flex-direction: row;
        justify-content: space-between;
        padding: 0;

        > .file-links {
            overflow: hidden;
        }
    }

    .link {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-decoration: underline;
        color: theme.$default-link-color;
        cursor: pointer;
        padding-right: 5px;

        &:hover {
            color: theme.$default-link-color;
        }
    }

    &.is-loading {
        .loader {
            padding-right: theme.$default-content-padding;
            place-self: center;

            &::after {
                display: inline-block;
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

    @keyframes spinAround {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(359deg);
        }
    }
}
</style>
