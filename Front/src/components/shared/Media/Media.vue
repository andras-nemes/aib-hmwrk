<template>
    <Pane
        class="a-media"
        :columns="!rows"
        :rows="rows"
        :class="{'is-small': small}"
        content-padding
    >
        <figure
            v-if="$slots.figure"
            class="media-left"
        >
            <slot name="figure">
                <i :class="icon" />
            </slot>
        </figure>
        <a-content>
            <slot />
        </a-content>
    </Pane>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Pane from '../PaneLayout.vue'

/**
 * Layout component to display icon and instructions on stacked fashion. Used with Notifications.
 */
export default defineComponent({
    name: 'Media',

    components: {
        Pane,
    },

    props: {
        /** By default, figure is an icon, and this is the class for the icon */
        icon: {
            type: String,
            default: 'fas fa-exclamation-circle',
        },
        /* Columns or rows */
        rows: {
            type: Boolean,
            default: false,
        },
        /** Small icon. Used in tooltips */
        small: {
            type: Boolean,
            default: false,
        },
    },
})
</script>

<style lang="scss">
.a-media {
    figure {
        display: flex;
        padding: 0;
        margin: 0;
        justify-content: center;
        align-items: center;

        > i {
            font-size: 3rem;
        }
    }

    .media-left {
        margin-right: 1rem;
    }

    .media-right {
        margin-left: 1rem;
    }

    .media-left,
    .media-right {
        flex-basis: auto;
        flex-grow: 0;
        flex-shrink: 0;
    }

    &.is-small {
        figure > i {
            font-size: 2rem;
        }
    }
}
ai-field + .a-media,
.a-modal-table-resizer + .a-media,
.a-media + .a-media {
    border-top: 1px solid rgba(219, 219, 219, 0.5);
    margin-top: 1rem;
    padding-top: 1rem;
}
</style>
