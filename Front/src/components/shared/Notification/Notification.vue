<template>
    <a-media
        class="modal-notification"
        :small="small"
    >
        <template #figure>
            <slot name="figure">
                <i
                    class="fas fa-exclamation-circle is-primary"
                />
            </slot>
        </template>
        <template #default>
            <slot name="content">
                <h3 v-if="!small">
                    <slot name="title">
                        <div> This is a notification. Fill the "title" -slot. </div>
                    </slot>
                </h3>
                <h6 v-else>
                    <slot name="title">
                        <div> This is a notification. Fill the "title" -slot.</div>
                    </slot>
                </h6>
                <slot name="info">
                    <div> {{ text }}</div>
                </slot>
            </slot>
        </template>
    </a-media>
</template>

<script lang="ts">
import Media from 'components/shared/Media/Media.vue'
import { defineComponent } from 'vue'

/**
 * Core Template for showing notifications. Extend and use slots to fill in necessary information
 */
export default defineComponent({
    components: {
        'a-media': Media,
    },

    props: {
        /** Text to display in the notification body */
        text: {
            type: String,
            default: null,
        },
        /** Render text and icon with small font. Used in tooltips */
        small: {
            type: Boolean,
            default: false,
        },
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
.modal-notification {
    align-items: center;
    overflow: hidden;

    h3 {
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 0.3rem;
        margin-bottom: 0.3rem;
    }

    > figure .is-primary {
        color: theme.$notification-icon-primary;
    }

    > figure .is-danger {
        color: theme.$notification-icon-danger;
    }
}
</style>
