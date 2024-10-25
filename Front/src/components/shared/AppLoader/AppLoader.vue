<template>
    <FullscreenLayout>
        <template #home-button>
            <a-button
                icon="fas fa-home"
                @click="$emit('home-clicked')"
            >
                <span>Home</span>
            </a-button>
        </template>

        <template #slogan>
            <slot name="slogan">
                Title
            </slot>
        </template>
        <template #description>
            <slot name="description">
                Description
            </slot>
        </template>
        <template #actions>
            <div
                class="spinner-container"
            >
                <span
                    v-if="showSpinner"
                    class="spinner"
                />
                <span :class="{'pulse' : isAnimated}">{{ message }}</span>
            </div>
        </template>

        <template
            v-if="error"
            #notification
            class="notification is-danger"
        >
            <div class="notification-left">
                <i class="icon is-large fa fa-times" />
            </div>
            <div class="notification-content">
                <p>{{ error.status || 'Error' }}</p>
                <p>{{ error.message }}</p>
            </div>
        </template>
        <template
            v-else-if="showNotification"
            #notification
        >
            <div class="notification-left">
                <i class="icon is-large fa fa-plug" />
            </div>
            <div class="notification-content">
                <MarkdownLayout
                    :source="$t('components.layout.app-loader.unusual-delay')"
                >
                </MarkdownLayout>
            </div>
        </template>
    </FullscreenLayout>
</template>

<script lang="ts">
import { AppLoadingMessages } from './AppLoader'
import FullscreenLayout from '../FullscreenLayout.vue'
import MarkdownLayout from '../MarkdownLayout.vue'
import type { AppLoadingError, Data } from './AppLoader'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import Button from '../Button/BaseButton.vue'

/** Application overlay loader.
 *  Use it during initial loading or when you need to hide interface while doing some async operation
 */
export default defineComponent({
    components: {
        FullscreenLayout,
        MarkdownLayout,
        'a-button': Button,
    },

    props: {
        /** Message to display on loader screen */
        message: {
            type: String as PropType<AppLoadingMessages>,
            default: AppLoadingMessages.Loading,
        },
        /** How long to load before showing unusual loading notification message */
        notificationDelay: {
            type: Number,
            default: 10000,
        },
        /** Error message to display on loader screen */
        error: {
            type: Object as PropType<AppLoadingError>,
            default: null,
        },
    },

    emits: ['home-clicked'],

    data(): Data {
        return {
            showNotification: false,
            showNotificationTimeout: null,
        }
    },

    computed: {
        /** Should animation be applied to the text */
        isAnimated(): boolean {
            // Only show animation for loading case
            return this.message === AppLoadingMessages.Loading
        },
        /** Should the spinner be shown */
        showSpinner(): boolean {
            // Only show spinner if message isn't the error message
            return this.message !== AppLoadingMessages.Error
        },
    },

    mounted() {
        this.showNotification = false

        if (this.showNotificationTimeout) {
            clearTimeout(this.showNotificationTimeout)
        }

        this.showNotificationTimeout = window.setTimeout(() => {
            this.showNotification = true
        }, this.notificationDelay)
    },
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

.fullscreen {
    .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        font-size: 1.25rem;
        font-weight: 700;

        .spinner {
            border: 5px solid theme.$grey-lightest;
            border-top: 5px solid theme.$primary;
            animation: spin 2s linear infinite;
            -webkit-animation: spin 2s linear infinite;
            height: 2rem;
            width: 2rem;
            border-radius: 100%;
        }
        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        @-webkit-keyframes spin {
            0% {
                -webkit-transform: rotate(0deg);
            }
            100% {
                -webkit-transform: rotate(360deg);
            }
        }
    }

    .notification {
        position: relative;
        user-select: text;
        background: theme.$fullscreen-card-bg;
        border-radius: theme.$card-border-radius;
        font-weight: 700;
        text-transform: uppercase;
        padding: 1.25rem 2.5rem 1.25rem 1.5rem;
        display: flex;
        text-align: left;
        align-items: flex-start;

        > .notification-left {
            margin-right: 1rem;
            flex-basis: auto;
            flex-grow: 0;
            flex-shrink: 0;

            > .icon {
                align-items: center;
                display: inline-flex;
                justify-content: center;
                width: 1.5rem;
                height: 1.5rem;

                font-size: 2rem;

                &.is-large {
                    width: 3rem;
                    height: 3rem;
                }
            }
        }

        > .notification-content {
            flex-basis: auto;
            flex-grow: 1;
            flex-shrink: 1;
            text-align: left;
            font-weight: 700;
            text-transform: uppercase;
        }

        &.is-danger {
            background: theme.$danger-light;
            border: 3px solid theme.$danger;
            border-radius: theme.$card-border-radius;

            .icon {
                color: theme.$danger;
            }
        }
    }
}
</style>
