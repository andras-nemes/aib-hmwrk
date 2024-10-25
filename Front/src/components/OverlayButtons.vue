<template>
    <PaneLayout v-if="buttons">
        <div
            v-for="(button, key) in buttons"
            :key="key"
        >
            <PrimaryButton
                v-if="button.link"
                class="margin-b-1 overlay__button"
                icon="fas fa-caret-right"
                icon-align="right"
                @click="handleRedirect(button.link)"
            >
                <span>{{ $t('components.actions.go-to.title', {text: button.text}) }}</span>
            </PrimaryButton>

            <PrimaryButton
                v-if="button.action"
                class="margin-b-1 overlay__button"
                :icon="button.icon"
                :icon-align="button.icon ? 'right' : 'none'"
                @click="button.action"
            >
                <span>{{ button.text }}</span>
            </PrimaryButton>
        </div>
    </PaneLayout>
</template>

<script setup lang="ts">
import { type RouteLocationRaw, useRouter } from 'vue-router'
import PaneLayout from './shared/PaneLayout.vue'
import PrimaryButton from './shared/PrimaryButton.vue'

export type OverlayButton = {
    text: string
    icon?: string
    link?: RouteLocationRaw
    action?: () => void
}

type Props = {
    buttons?: OverlayButton[]
}

withDefaults(defineProps<Props>(), {
    buttons: () => [],
})

const emit = defineEmits<{
    error: [err: unknown]
}>()

const router = useRouter()

function handleRedirect(link: RouteLocationRaw): void {
    router.push(link).catch((err: unknown) => {
        emit('error', err)
    })
}
</script>