<template>
    <a-pane
        class="rich-text-editor"
        :style="{ maxWidth: maxWidth + 'px' }"
        @click="($event: Event) => $emit('click', $event)"
    >
        <template #header>
            <div
                v-if="!disabled"
                class="menubar"
            >
                <ai-controlbar
                    v-if="editor"
                    @mouseenter="() => inControlBar = true"
                    @mouseleave="() => inControlBar = false"
                >
                    <a-button
                        icon="fa fa-bold"
                        :class="{ 'is-active': editor.isActive('bold')}"
                        :title="$t('components.rich-text.bold.tooltip')"
                        @click="editor.chain().focus().toggleBold().run()"
                    >
                    </a-button>
                    <a-button
                        icon="fa fa-italic"
                        :class="{ 'is-active': editor.isActive('italic')}"
                        :title="$t('components.rich-text.italic.tooltip')"
                        @click="editor.chain().focus().toggleItalic().run()"
                    >
                    </a-button>

                    <a-button
                        icon="fa fa-underline"
                        :class="{ 'is-active': editor.isActive('underline') }"
                        :title="$t('components.rich-text.underline.tooltip')"
                        @click="editor.chain().focus().toggleUnderline().run()"
                    >
                    </a-button>
                    <a-button
                        icon="fa fa-list"
                        :class="{ 'is-active': editor.isActive('bulletList') }"
                        :title="$t('components.rich-text.bullet-list.tooltip')"
                        @click="editor.chain().focus().toggleBulletList().run()"
                    >
                    </a-button>

                    <a-button
                        icon="fa fa-list-ol"
                        :class="{ 'is-active': editor.isActive('orderedList') }"
                        :title="$t('components.rich-text.numbered-list.tooltip')"
                        @click="editor.chain().focus().toggleOrderedList().run()"
                    >
                    </a-button>
                    <a-button
                        v-if="canInsertImage"
                        :disabled="isLoadingImages"
                        :loading="isLoadingImages"
                        icon="fa fa-upload"
                        :title="$t('components.rich-text.insert-image.tooltip')"
                        @click="handleInsertImage"
                    >
                    </a-button>
                    <input
                        id="image-input"
                        ref="imageUpload"
                        type="file"
                        style="display: none"
                        accept="image/png, image/jpeg"
                        @change="uploadImage"
                    />
                    <a-button
                        v-if="canInsertTable"
                        :icon-component="AddTable"
                        :title="$t('components.rich-text.table.add.tooltip')"
                        @click="editor.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: false }).run()"
                    >
                    </a-button>
                    <div
                        v-if="canInsertTable && editor.isActive('table')"
                        class="tablebar"
                    >
                        <a-button
                            :icon-component="DeleteTable"
                            :title="$t('components.rich-text.table.delete.tooltip')"
                            @click="() => {
                                // Manually set inControlBar to false.
                                // Deleting the table removes the tablebar from under the cursor, which doesn't count as mouseleave from control bar.
                                inControlBar = false
                                editor?.chain().focus().deleteTable().focus().run()
                            }"
                        >
                        </a-button>
                        <a-button
                            :icon-component="AddRowBefore"
                            :title="$t('components.rich-text.table.add-row-before.tooltip')"
                            @click="editor.chain().focus().addRowBefore().run()"
                        >
                        </a-button>
                        <a-button
                            :icon-component="AddRowAfter"
                            :title="$t('components.rich-text.table.add-row-after.tooltip')"
                            @click="editor.chain().focus().addRowAfter().run()"
                        >
                        </a-button>
                        <a-button
                            :icon-component="DeleteRow"
                            :title="$t('components.rich-text.table.delete-row.tooltip')"
                            @click="editor.chain().focus().deleteRow().run()"
                        >
                        </a-button>
                        <a-button
                            :icon-component="AddColumnBefore"
                            :title="$t('components.rich-text.table.add-column-before.tooltip')"
                            @click="editor.chain().focus().addColumnBefore().run()"
                        >
                        </a-button>
                        <a-button
                            :icon-component="AddColumnAfter"
                            :title="$t('components.rich-text.table.add-column-after.tooltip')"
                            @click="editor.chain().focus().addColumnAfter().run()"
                        >
                        </a-button>
                        <a-button
                            :icon-component="DeleteColumn"
                            :title="$t('components.rich-text.table.delete-column.tooltip')"
                            @click="editor.chain().focus().deleteColumn().run()"
                        >
                        </a-button>
                        <a-button
                            :icon-component="ToggleCellMerge"
                            :title="$t('components.rich-text.table.toggle-cell-merge.tooltip')"
                            @click="editor.chain().focus().mergeOrSplit().run()"
                        >
                        </a-button>
                        <a-button
                            :icon-component="ToggleHeaderCell"
                            :title="$t('components.rich-text.table.toggle-header.tooltip')"
                            @click="editor.chain().focus().toggleHeaderCell().run()"
                        >
                        </a-button>
                    </div>
                </ai-controlbar>
                <a-button
                    v-if="canOpenInModal"
                    icon="fa fa-expand-alt"
                    class="expand"
                    :title="$t('components.rich-text.enlarge-to-modal.tooltip')"
                    @click="handleOpenModal"
                >
                    <span>{{ $t('components.rich-text.enlarge-to-modal.title') }}</span>
                </a-button>
            </div>
        </template>
        <template #content>
            <EditorContent
                class="rich-text-content"
                :editor="editor"
                :disabled="disabled"
            >
            </EditorContent>
        </template>
    </a-pane>
</template>

<script setup lang="ts">
/**
 * RichTextEditor to edit description with Rich Text capabilities. System supports bullet and numbered lists, undo/redo and other features which are disabled
 * Editor internally uses npm package called 'tiptap' which is based on ProseMirror.
 */
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Gapcursor from '@tiptap/extension-gapcursor'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import HardBreak from '@tiptap/extension-hard-break'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import History from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import AibidiaImage from 'lib/AibidiaTiptapImage'
import Dropcursor from '@tiptap/extension-dropcursor'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { cleanWordPasteHTML } from 'lib/helpers'
import SaveCancel from 'components/shared/ActionGroups/SaveCancel.vue'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounce } from './useDebounce'
import { useGlobalRefsStore } from 'lib/GlobalRefsStore'
import {
    AddColumnAfter,
    AddColumnBefore,
    AddRowAfter,
    AddRowBefore,
    AddTable,
    DeleteColumn,
    DeleteRow,
    DeleteTable,
    ToggleCellMerge,
    ToggleHeaderCell,
} from './TableIcons'
import type { TableStyles } from './richTextTableConstants'
import { defaultRichTextTableStyles, objectToStyleString } from './richTextTableConstants'

interface Props {
    /** Override value to be either string or number */
    modelValue?: string | number
    disabled?: boolean
    /** Should submit input value on blur? */
    blurSubmits?: boolean
    returnSubmits?: boolean
    /** Can open in a modal */
    canOpenInModal?: boolean
    /** Can insert image in a modal */
    canInsertImage?: boolean
    /** Can insert a table to the editor */
    canInsertTable?: boolean
    /** Styles for the table */
    tableStyles?: TableStyles
    /** String to show as label of the field */
    label?: string | null
    /** True, if field should keep focus. False if user click outside the editor area. */
    isFieldFocused?: boolean
    /** Pixel value to use as max-width. */
    maxWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    disabled: false,
    blurSubmits: true,
    returnSubmits: false,
    canOpenInModal: true,
    canInsertImage: false,
    canInsertTable: false,
    tableStyles: () => defaultRichTextTableStyles,
    label: null,
    isFieldFocused: false,
    maxWidth: 600,
})

const { t } = useI18n()

const globalRefsStore = useGlobalRefsStore()

const emit = defineEmits([
    'click',
    'focus',
    'blur',
    'update:modelValue',
    'submit',
    'change-preferred-size',
])

const { emitPreferredSize } = useDebounce(emit)

/** Override internalValue type to be stricter for the context of this Editor **/
const internalValue = ref<string | null>(props.modelValue?.toString() || null)
/** InternalValue with fetched images **/
const internalValueWithImage = ref<string | null>(null)
/** Override originalValue type to be stricter for the context of this Editor **/
const originalValue = ref<string | null>(props.modelValue?.toString() || null)
/** Internal instance of the tiptap editor **/
const editor = useEditor({
    extensions: [
        Document,
        Paragraph,
        Text,
        // Extension which adds line breaks which starts new paragraphs
        HardBreak,
        // Bullet point list
        BulletList,
        // Ordered or numeric list 1. 2. 3. ...
        OrderedList,
        // Bold/Strong items
        Bold,
        // Italic/Emphasis items
        Italic,
        // Underline items
        Underline,
        // List items for bullet or ordered lists
        ListItem,
        // Undo, redo support
        History,
        // Image
        AibidiaImage,
        // Shows a cursor at the drop position when something is dragged into the editor.
        Dropcursor,
        Gapcursor,
        // Table
        Table.configure({
            HTMLAttributes: {
                style: objectToStyleString(props.tableStyles.table),
            },
        }),
        TableCell.configure({
            HTMLAttributes: {
                style: objectToStyleString(props.tableStyles.tableCell),
            },
        }),
        TableHeader.configure({
            HTMLAttributes: {
                style: objectToStyleString(props.tableStyles.tableHeader),
            },
        }),
        TableRow.configure({
            HTMLAttributes: {
                style: objectToStyleString(props.tableStyles.tableRow),
            },
        }),
    ],
    content: String(props.modelValue),
    parseOptions: {
        preserveWhitespace: true,
    },
    editorProps: {
        transformPastedHTML: html =>
            cleanWordPasteHTML(html, props.canInsertImage, props.canInsertTable),
        handlePaste: handlePaste,
    },
    autofocus: !props.canOpenInModal && 'end',
    onUpdate: ({ editor }) => {
        // Get new content on update.
        const html = editor.getHTML()

        // At minimum, Tiptap html is '<p></p>' if user has cleared everything from the editor.
        // In that case, value is considered to be null.
        const newValue = html !== '<p></p>' ? wrapOutput(html) : null

        // This change in internal, so the next watcher update on 'value' should not update the content.
        isInternalChange.value = true
        internalValue.value = newValue
        emit('update:modelValue', newValue)
    },
    onFocus: ({ event }) => {
        handleFocus(event)
    },
    onBlur: ({ event }) => {
        handleBlur(event)
    },
    editable: !props.disabled,
})

/** Is the value change internal (when TipTap onUpdate is called) or external change (parent changes prop value). */
const isInternalChange = ref<boolean>(true)
/** Is the editor loading richtext images */
const isLoadingImages = ref<boolean>(false)
/** Is the mouse in control bar area */
const inControlBar = ref<boolean>(false)

const imageUpload = ref<HTMLInputElement | null>(null)

/** When external value changes, set the internal content */
watch(
    () => props.modelValue,
    newVal => {
        if (props.canInsertImage) {
            fetchImages(String(newVal))
        }

        internalValue.value = newVal.toString() || null
        // Set the content only if the change originated externally and not from Tiptap.
        if (editor.value && !isInternalChange.value) {
            editor.value.commands.setContent(internalValue.value || '')
        }

        // Further changes should set the editor content until Tiptap onUpdate is called.
        isInternalChange.value = false
    }
)

/** When disabled flag changes, update editor to match */
watch(
    () => props.disabled,
    () => {
        editor.value?.setOptions({
            editable: !props.disabled,
        })
    }
)

watch(internalValueWithImage, newVal => {
    internalValue.value = newVal || null

    if (editor.value) {
        editor.value.commands.setContent(newVal || '')
    }

    // This change in internal, so the next watcher update on 'value' should not update the content.
    isInternalChange.value = true
})

onMounted(() => {
    internalValue.value = props.modelValue?.toString() || null
    originalValue.value = props.modelValue?.toString() || null
    isInternalChange.value = false
})

onBeforeUnmount(() => {
    // Clean up editor if it is defined
    if (editor.value) {
        editor.value.destroy()
    }
})

/** Wrap output in a root tag article */
function wrapOutput(content: string): string {
    return `<article>${content}</article>`
}

/** Handler when Editable content has been focused */
function handleFocus(tiptapEvent: FocusEvent): void {
    emit('focus', tiptapEvent)
    emitPreferredSize()
}

/** Handler when Editable content has lost focus */
function handleBlur(tiptapEvent: FocusEvent): void {
    emit('blur', tiptapEvent)
    emitPreferredSize()
    if (props.blurSubmits && !inControlBar.value) {
        submit()
    }
}

/** Call image service plugin and add append image links to content. */
async function fetchImages(value: string): Promise<void> {
    isLoadingImages.value = true
    internalValueWithImage.value = (await globalRefsStore.imageService.loadImages(value)) || null
    isLoadingImages.value = false
}

/** Handle when paste data to editor */
function handlePaste(view: unknown, event: ClipboardEvent): boolean | void {
    const html = event.clipboardData?.getData('text/html')

    if (props.canInsertImage !== true && !!html?.toString().match(/<img/)) {
        globalRefsStore.imageService.throwImageNotAllowedException()
    }
}

/** Convert HTML br-tags and img-tags to XHTML compatible self-closing tags. */
function closeHtmlTags(content: string): string {
    const value = content
        // Replace <br> tags with <br/>
        .replace(/<br\s*?>/gi, '<br/>')
        // Replace <img attribute="etc"> or <img attribute="etc"/> tags with <img attribute="etc"></img>
        .replace(/(<img [^>]*?)>(?!(<\/img>))/gi, matchedString => {
            return matchedString + '</img>'
        })

    return value
}

/** Handler when editor submits the value edit. */
function submit(): void {
    let value = internalValue.value ? closeHtmlTags(internalValue.value) : null

    // If value is empty string or '<p></p>', the user has cleared everything from the editor. Emit null in that case.
    if (value === '' || value === '<p></p>') {
        value = null
    }

    emit('update:modelValue', value)
    emit('submit', value)
}

/** Handler when user wants to edit the value in a modal */
async function handleOpenModal(): Promise<void> {
    const editTitle = t('modals.edit-entity-description.title', {
        label: props.label || '',
    }) as string

    // Wait for the RichTextModal which allows user to edit the value in new window
    const result = await globalRefsStore.modals.edit.crud({
        title: editTitle,
        editorComponent: (await import('components/shared/Modal')).RichTextModal,
        editorProps: {
            formObject: {
                description: internalValue.value,
            },
            descriptionKey: 'description',
            canInsertImage: props.canInsertImage,
            canInsertTable: props.canInsertTable,
            tableStyles: props.tableStyles,
        },
        actionsComponent: SaveCancel,
        modalWidth: 700,
    })

    if (
        result === null ||
        result === undefined ||
        typeof result === 'string' ||
        typeof result === 'boolean'
    ) {
        // User cancelled the edit
        return
    }

    // Result is ItemsResult type with exactly one item.
    internalValue.value = result[0].description
    submit()
}

/** Handler when user wants to insert image to editor */
function handleInsertImage(): void {
    imageUpload.value?.click()
}

/** Upload image. */
async function uploadImage(e: Event): Promise<void> {
    e.preventDefault()
    isLoadingImages.value = true

    if (!imageUpload.value) {
        return
    }

    const image = await globalRefsStore.imageService.postImage(imageUpload.value)
    isLoadingImages.value = false
    if (image) {
        editor.value
            ?.chain()
            .focus()
            .setImageWithId({ src: image.Link, 'data-image-id': image.Id })
            .run()
    }

    isLoadingImages.value = false
    if (imageUpload.value) {
        imageUpload.value.value = ''
    }
}
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
.rich-text-editor {
    .tablebar {
        margin-top: calc(0.625em - 1px);
    }

    .table-icon {
        margin: auto;
    }
    .ProseMirror {
        padding: 0;

        &:focus {
            outline: none;
        }

        ul,
        ol {
            padding-inline-start: 2em;
        }

        p {
            padding-bottom: 1em;
        }

        img {
            max-width: 100%;
            height: auto;

            &.ProseMirror-selectednode {
                border: 1px solid theme.$control-border-color-focus;
                box-shadow: theme.$control-box-shadow-focus;
            }
        }

        table .selectedCell:after {
            background: rgba(200, 200, 255, 0.4);
            content: '';
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
        }
    }
}
</style>
