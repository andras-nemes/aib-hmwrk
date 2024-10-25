<template>
    <Pane
        content-padding
        content-grow
    >
        <PageLayout>
            <template #default>
                <OneThirdsLayout class="value-allocation-layout">
                    <template #first>
                        <Card scrollable>
                            <template #header>
                                <CardHeader> Card One Title </CardHeader>
                            </template>

                            Content One
                        </Card>
                    </template>
                    <template #second>
                        <Card scrollable>
                            <template #header>
                                <CardHeader> Card Two Title </CardHeader>
                            </template>

                            Content Two
                        </Card>
                    </template>
                </OneThirdsLayout>
            </template>
        </PageLayout>
    </Pane>
</template>

<script lang="ts">
import Pane from 'components/shared/PaneLayout.vue'
import CardHeader from 'components/shared/Card/CardHeader.vue'
import Card from 'components/shared/Card/CardLayout.vue'
import PageLayout from 'components/shared/PageLayout.vue'
import OneThirdsLayout from 'components/shared/OneThirdsLayout.vue'

import { defineComponent } from 'vue'

// Todo: implement content for card one and card two
export default defineComponent({
    components: {
        Pane,
        CardHeader,
        Card,
        PageLayout,
        OneThirdsLayout,
    },
})
</script>

<style lang="scss">
ai-pane.is-grid.one-thirds-layout.value-allocation-layout {
    grid-template-columns: 1fr 1fr;

    .a-weight-editor {
        min-height: 120px;

        ai-overlay > ai-rows > ai-content {
            padding: 0 8%;

            > p {
                font-size: 12px;
            }
        }
    }
}
</style>
