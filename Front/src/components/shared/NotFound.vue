<template>
    <a-fullscreen-layout>
        <template #slogan>
            {{ $t('components.layout.app-loader.page-not-found') || 'Oops! Page Not Found.' }}
        </template>
        <template #actions>
            <a-field-layout no-label-element>
                <a-button
                    icon="fas fa-caret-left"
                    @click="$router.go(-1)"
                >
                    <span>{{ $t('views.user.invite-users.button.back') || 'Go Back' }}</span>
                </a-button>
            </a-field-layout>
        </template>
    </a-fullscreen-layout>
</template>

<script lang="ts">
import FullscreenLayout from './FullscreenLayout.vue'
import FieldLayout from './FieldLayout.vue'
import { defineComponent } from 'vue'

export default defineComponent({
    components: {
        'a-fullscreen-layout': FullscreenLayout,
        'a-field-layout': FieldLayout,
    },

    extends: FullscreenLayout,
})
</script>


