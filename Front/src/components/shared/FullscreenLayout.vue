<template>
    <FullscreenImage>
        <PaneLayout
            class="fullscreen background-brand"
            align-items="center"
        >
            <div class="home-button">
                <slot name="home-button" />
            </div>
            <ContentLayout>
                <slot name="logo">
                    <MainLogo class="logo"></MainLogo>
                </slot>

                <h2 class="title">
                    <slot name="title" />
                </h2>

                <h2
                    v-if="$slots.slogan"
                    class="slogan"
                >
                    <slot name="slogan" />
                </h2>

                <h2 class="caption">
                    <slot name="caption" />
                </h2>

                <p class="description">
                    <slot name="description" />
                </p>

                <PaneLayout
                    columns
                    content-separation
                    :grow="0"
                >
                    <slot name="actions" />
                </PaneLayout>

                <article class="notification">
                    <slot name="notification" />
                </article>

                <slot name="default" />
            </ContentLayout>
        </PaneLayout>
    </FullscreenImage>
</template>

<script setup lang="ts">
/**
 * Layout component to display fullscreen page.
 */
import MainLogo from './MainLogo.vue'
import PaneLayout from './PaneLayout.vue'
import ContentLayout from './ContentLayout.vue'
import FullscreenImage from './FullscreenImage.vue'

interface Props {
    loading?: boolean
}

withDefaults(defineProps<Props>(), {
    loading: false,
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

.fullscreen {
    bottom: 0;
    display: flex;
    flex-direction: column;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 9999;
    user-select: none;

    height: 100vh;
    text-align: center;
    justify-content: center;
    display: flex;
    align-items: center;
    color: theme.$default-text-color;

    &.background-brand {
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            background-size: cover;
            filter: theme.$fullscreen-filter;
            z-index: -1;
        }
    }

    .home-button {
        position: absolute;
        top: 2.5rem;
        left: 3rem;
    }
    .caption {
        font-size: theme.$fullscreen-description-font-size;
    }

    .logo {
        height: theme.$fullscreen-logo-height;
        fill: theme.$fullscreen-logo-color;
        padding: theme.$default-padding;
    }

    .title {
        font-size: theme.$fullscreen-title-font-size;
    }

    .slogan {
        margin-top: 0px;
        font-weight: 700;
        font-size: theme.$fullscreen-slogan-font-size;
        text-transform: none;
    }

    .description {
        font-size: theme.$fullscreen-description-font-size;
        color: theme.$grey;
        margin-bottom: 4rem;
    }

    .pulse {
        animation: pulse 2s infinite;
    }
}

@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
    100% {
        opacity: 1;
    }
}
</style>
