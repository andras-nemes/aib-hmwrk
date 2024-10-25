<template>
    <PageLayout>
        <Pane
            columns
            :grow="1"
            content-grow
            content-separation
        >
            <Card
                content-grow
                scrollable
                align-items="flex-start"
                content-padding
                content-separation
            >
                <Markdown
                    pad
                    :source="$t('views.general.introduction.description')"
                >
                </Markdown>
            </Card>
        </Pane>
    </PageLayout>
</template>

<script lang="ts">
import Pane from 'components/shared/PaneLayout.vue'
import Card from 'components/shared/Card/CardLayout.vue'
import Markdown from 'components/shared/MarkdownLayout.vue'
import PageLayout from 'components/shared/PageLayout.vue'
import { defineComponent } from 'vue'

export default defineComponent({
    components: {
        Pane,
        Card,
        Markdown,
        PageLayout,
    },
})
</script>
