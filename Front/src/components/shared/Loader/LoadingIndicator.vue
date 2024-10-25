<template>
    <div
        class="a-loading-indicator"
        :class="{full: fullForm, 'is-active': internalActive}"
    >
        <div class="background" />
        <div class="icon" />
        <template v-if="fullForm">
            <span
                v-if="text"
                class="text"
            >{{ text }}</span>
            <transition-group
                v-if="items.length"
                name="complete"
                tag="ul"
            >
                <li
                    v-for="item in items"
                    :key="item.key"
                    class="complete-item"
                    :class="{ok: item.ok, err: item.err}"
                >
                    {{ item.desc }}
                </li>
            </transition-group>
        </template>
    </div>
</template>

<script setup lang="ts">
/**
 * Loading indicator
 */
import type { DataLoadingObject } from './types'
import { ref, computed, watch, onBeforeUnmount } from 'vue'

interface Props {
    /** Is loader active and should be shown? */
    active: boolean
    /** Should full form be used? */
    fullForm?: boolean
    /** Loading text that should be shown in full form */
    text?: string
    //** Are we loading any data? */
    fetches?: DataLoadingObject[]
}

type TimerHandle = number

const props = withDefaults(defineProps<Props>(), {
    fullForm: false,
    text: '',
    fetches: () => [],
})

const internalActive = ref<boolean>(props.active)
const activeDebounce = ref<TimerHandle | null>(null)

/** Sorted data fetching objects */
const items = computed<DataLoadingObject[]>(() => props.fetches.filter(a => !a.ok))

watch(
    () => props.active,
    value => {
        if (activeDebounce.value) {
            clearTimeout(activeDebounce.value)
        }

        if (!value) {
            internalActive.value = value
            return
        }

        // Previously we had timeout higher than 0 when there were 3+ parallel requests.
        // But that made loader behaviour unpredictable, loader was not shown when these were really fast requests,
        // and tests failed
        activeDebounce.value = window.setTimeout(() => {
            internalActive.value = value
        }, 0)
    }
)

onBeforeUnmount(() => {
    if (activeDebounce.value) {
        clearTimeout(activeDebounce.value)
    }
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';

.a-loading-indicator {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    align-items: center;
    display: none;
    justify-content: center;
    overflow: hidden;
    z-index: 205;

    &.is-active {
        display: flex;
    }

    > .background {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        background: #7f7f7f;
        background: rgba(255, 255, 255, 0.5);
        z-index: 103;
        cursor: wait;
    }

    > .icon {
        position: relative;

        margin-left: 0px;
        font-size: 1rem;

        &:after {
            animation: spinAround 500ms infinite linear;
            border: 2px solid #dbdbdb;
            border-color: theme.$primary;
            border-radius: 290486px;
            border-right-color: transparent;
            border-top-color: transparent;
            content: '';
            display: block;
            height: 1rem;
            position: relative;
            width: 1rem;
            position: absolute;
            top: calc(50% - 1.5rem);
            left: calc(50% - 1.5rem);
            width: 3rem;
            height: 3rem;
            border-width: 0.25rem;
        }
    }

    > .text {
        padding-left: 3em;
        padding-top: 0.625em;
        font-size: 1rem;
    }

    > {
        ul {
            list-style: none;
            padding-left: 1em;
        }

        ul li:before {
            content: '⋯';
        }

        ul li.ok:before {
            content: '✓';
            color: theme.$success;
        }

        ul li.err:before {
            content: '❌';
            color: theme.$danger;
        }
    }

    .complete-item {
        transition: transform 0.3s ease-out, opacity 0.3s ease 0.5s;
    }

    .complete-enter,
    .complete-leave-to {
        opacity: 0;
    }

    .complete-enter-active {
        transition-delay: 0.5s;
    }

    .complete-leave-active {
        position: relative;
        &:before {
            content: '✓';
            color: theme.$success;
        }
    }

    @include mixins.smallerThanTablet {
        > .text {
            display: none;
        }

        > ul {
            display: none;
        }
    }
}
</style>

