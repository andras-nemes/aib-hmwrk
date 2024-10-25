<template>
    <div class="a-card-header">
        <slot name="before-title" />
        <span class="a-title">
            <slot v-if="!internalEditingTitle">
                {{ editableTitle }}
            </slot>
            <PaneLayout
                v-if="internalEditingTitle"
                align-items="flex-start"
            >
                <TextField
                    ref="editorInput"
                    v-model="internalTitle"
                    class="a-title-input"
                    no-label-element
                    :placeholder="placeholderTitle"
                    :max-length="255"
                    :show-counter="false"
                    :message="validationMessage"
                    :error="validationMessage ? { message: validationMessage } : null"
                    @update:model-value="emit('validate-title-edit', internalTitle)"
                >
                </TextField>
            </PaneLayout>
            <span
                v-if="$slots.subtitle"
                class="a-subtitle"
            >
                <slot name="subtitle" />
            </span>
        </span>

        <slot name="after-title" />

        <span
            v-if="$slots.counter"
            class="counter"
            data-cy="entity-counter"
        >
            <slot name="counter" />
        </span>

        <PaneLayout
            v-if="editableTitle !== undefined"
            columns
            :grow="0"
        >
            <PrimaryButton
                v-if="!internalEditingTitle"
                class="is-primary is-flat"
                :title="$t('components.actions.edit-title.tooltip')"
                icon="fas fa-edit"
                @click="edit"
            >
            </PrimaryButton>
            <PrimaryButton
                v-if="internalEditingTitle"
                class="is-flat margin-r-1"
                :title="$t('components.actions.save-title.tooltip')"
                icon="fas fa-save"
                :disabled="!titleValid"
                @click="save"
            >
            </PrimaryButton>
            <PrimaryButton
                v-if="internalEditingTitle"
                class="is-flat"
                icon="fas fa-times"
                :title="$t('components.actions.cancel-title.tooltip')"
                @click="cancel"
            >
            </PrimaryButton>
        </PaneLayout>

        <PaneLayout
            v-if="$slots.controls"
            :grow="0"
            columns
            class="controls"
        >
            <slot name="controls" />
        </PaneLayout>
    </div>
</template>

<script lang="ts" setup>
/**
 * Component to use with Card to add header element to the card.
 * Title is optionally editable, and holds a place for an optional counter.
 */
import { ref, computed, toRef } from 'vue'
import PaneLayout from '../PaneLayout.vue'
import PrimaryButton from 'components/shared/Button/PrimaryButton.vue'
import TextField from '../Fields/TextField.vue'

export interface Props {
    /** Editable title string */
    editableTitle?: string
    /** Placeholder for editable title input when title is not defined */
    placeholderTitle?: string
    /** Validate message error for invalid title */
    validationMessage?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'validate-title-edit': [internalTitle: string | undefined]
    'start-title-edit': []
    'cancel-title-edit': []
    'save-title': [internalTitle: string | undefined]
}>()

/** Is the title currently being edited */
const internalEditingTitle = ref<boolean>(false)
/** Internal state for the title */
const internalTitle = toRef(props, 'editableTitle')

/** Is editing title valid? If not, save button is disabled */
const titleValid = computed<boolean>(() => {
    if (!internalEditingTitle.value || !internalTitle.value || props.validationMessage) {
        return false
    }

    return internalTitle.value.length > 0
})

/** Handler for clicking edit button on editable title */
function edit(): void {
    if (!internalEditingTitle.value) {
        internalEditingTitle.value = true
        internalTitle.value = props.editableTitle
        emit('start-title-edit')
    }
}

/** Handler for clicking cancel button on editable title */
function cancel(): void {
    if (internalEditingTitle.value) {
        internalEditingTitle.value = false
        internalTitle.value = props.editableTitle
        emit('cancel-title-edit')
    }
}

/** Handler for clicking save button on editable title */
function save(): void {
    if (internalEditingTitle.value) {
        internalEditingTitle.value = false
        emit('save-title', internalTitle.value)
    }
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
.a-card-header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    min-width: 0;
    overflow: hidden;

    background-color: theme.$card-header-bg;
    border-bottom: 1px solid theme.$default-border-color;

    padding: calc(#{theme.$default-content-padding} * 0.5)
        calc(#{theme.$default-content-padding} * 2);

    flex: 1;
    &,
    & > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    > .a-title {
        padding-right: 1em;
        margin: 0;
        font-weight: 700;
        font-size: theme.$card-header-title-font-size;
        color: theme.$card-header-title-color;
        flex-grow: 1;
        min-width: 0;

        > .a-subtitle {
            white-space: nowrap;
            font-weight: 400;
            color: theme.$card-header-subtitle-color;
            font-size: theme.$card-header-subtitle-font-size;
            margin-left: 0.375rem;
            min-width: 0;
        }
    }

    ai-field {
        > .value {
            margin: 0;
        }
    }

    button,
    ai-field > .value > ai-field-editor > input:not([type='checkbox']) {
        height: initial;
    }

    button {
        padding-left: 0.675em;
        padding-right: 0.675em;
    }

    .counter {
        color: theme.$card-header-counter-color;
        font-size: theme.$card-header-counter-font-size;
        min-width: 0;
        align-self: center;
    }
}
</style>
