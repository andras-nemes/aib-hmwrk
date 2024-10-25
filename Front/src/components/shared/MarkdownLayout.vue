<template>
    <!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
    <ContentLayout
        v-if="renderedText && renderedText.length"
        class="typography"
        :pad="pad"
        v-html="renderedText"
    >
    </ContentLayout>
    <!-- eslint-enable -->
</template>

<script setup lang="ts">
/**
 * Layout component to display markdown rendered text.
 */
import ContentLayout from './ContentLayout.vue'
import MarkdownIt from 'markdown-it'
import { ref, computed, onBeforeMount } from 'vue'

interface Props {
    /** Markdown source. */
    source: string | null
    /** Add default padding. */
    pad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    source: null,
    pad: false,
})

/** Markdown renderer instance. */
const renderer = ref<MarkdownIt | null>(null)

/** Markdown source string made reactive. */
const sourceData = computed<string | null>(() => props.source)

/** Markdown-it rendered HTML. */
const renderedText = computed<string | null>(() => {
    if (!sourceData.value || !renderer.value) {
        return null
    }

    return renderer.value.render(sourceData.value)
})

onBeforeMount(() => {
    renderer.value = new MarkdownIt()
    // Configure links to be opened in the new tab.
    renderer.value.renderer.rules.link_open = function (tokens, idx, options, _env, self) {
        // Check if other plugins add `target` attribute or not.
        if (tokens[idx].attrIndex('target') < 0) {
            // Add new attribute
            tokens[idx].attrPush(['target', '_blank'])
        }

        return self.renderToken(tokens, idx, options)
    }
})
</script>
