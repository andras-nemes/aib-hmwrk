<template>
    <PageLayout
        :columns="false"
        :rows="true"
    >
        <template #pagetabs>
            <slot name="pagetabs" />
        </template>

        <template
            v-if="$slots.tips"
            #tips
        >
            <slot name="tips" />
        </template>

        <template
            v-if="$slots.filters"
            #filters
        >
            <slot name="filters" />
        </template>

        <Card
            content-grow
            :scrollable="false"
            :content-padding="false"
        >
            <template #header>
                <CardHeader>
                    <template #default>
                        <slot name="title" />
                    </template>
                    <template #counter>
                        <slot name="counter" />
                    </template>
                    <template #controls>
                        <slot name="controls" />
                    </template>
                </CardHeader>
            </template>

            <slot v-if="!loadingEditor" />
            <PaneLayout
                v-else
                has-loader
                loading
            >
            </PaneLayout>
        </Card>

        <template #modals>
            <slot name="modals" />
        </template>

        <template #loader>
            <slot name="loader" />
        </template>
    </PageLayout>
</template>

<script lang="ts" setup>
/**
 * Default Page layout to be used to display single table editor content.
 */
import { Card, CardHeader } from './Card'
import PageLayout from './PageLayout.vue'
import PaneLayout from './PaneLayout.vue'
import { ref, onBeforeMount, onMounted } from 'vue'

const loadingEditor = ref(true)

onBeforeMount(() => {
    loadingEditor.value = true
})

onMounted(() => {
    setTimeout(() => {
        loadingEditor.value = false
    }, 10)
})
</script>
