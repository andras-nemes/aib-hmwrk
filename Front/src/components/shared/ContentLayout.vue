<template>
    <ai-scrollwrapper
        v-if="scrollable"
    >
        <ai-scroll
            @scroll="($event: Event) => $emit('scroll', $event)"
        >
            <ai-content
                :class="contentClass"
            >
                <slot />
            </ai-content>
        </ai-scroll>
    </ai-scrollwrapper>
    <ai-content
        v-else
        :class="contentClass"
    >
        <slot />
    </ai-content>
</template>

<script setup lang="ts">
/**
 * Vue Component to display regular typography content.
 * Content is typically used to display textual content, with minimal markup.
 * This allows developers to add marked text to UI without having to worry about spacing/margins/sizes.
 *
 * There are some helper props to quickly alter the behaviour of the content in flex-box layouts.
 *
 * Currently supported tags;
 * <h1-6>
 * <p>
 * <ul/ol>
 */
import { computed } from 'vue'

interface ContentClasses {
    /** flex grow: 1 */
    fg1?: boolean
    /** flex grow: 2 */
    fg2?: boolean
    /** flex grow: 3 */
    fg3?: boolean
    /** flex grow: 4 */
    fg4?: boolean
    /** flex grow: 5 */
    fg5?: boolean
    /** flex grow: 6 */
    fg6?: boolean
    /** flex shrink: 1 */
    fs1?: boolean
    /** flex shrink: 2 */
    fs2?: boolean
    /** flex shrink: 3 */
    fs3?: boolean
    /** flex shrink: 4 */
    fs4?: boolean
    /** flex shrink: 5 */
    fs5?: boolean
    /** flex shrink: 6 */
    fs6?: boolean
    /** Add default padding to content */
    pad?: boolean
    /** Add default margin to content */
    mrg?: boolean
    /** Align Vertically center */
    avc?: boolean
    /** Align Vertically bottom */
    avb?: boolean
    /** Align Horizontally right */
    ahr?: boolean
    /** Align Horizontally center */
    ahc?: boolean
}

export interface Props {
    /** Should we shrink flex-shrink:1? */
    shrink?: boolean | number
    /** Should we grow flex-grow:1? */
    grow?: boolean | number
    /** Should we add default padding? */
    pad?: boolean
    /** Should we add default margin? */
    margin?: boolean
    /** If the content should be scrollable */
    scrollable?: boolean
    /** Align Vertically */
    alignVertically?: string
    /** Align Horizontally */
    alignHorizontally?: string
}

const props = withDefaults(defineProps<Props>(), {
    grow: false,
    shrink: false,
    pad: false,
    margin: false,
    scrollable: false,
    alignVertically: 'top',
    alignHorizontally: 'left',
})

defineEmits<{
    scroll: [$event: Event]
}>()

/** Calculated Content classes */
const contentClass = computed(() => {
    const cls: ContentClasses = {
        fg1: props.grow === true || props.grow === 1,
        fg2: props.grow === 2,
        fg3: props.grow === 3,
        fg4: props.grow === 4,
        fg5: props.grow === 5,
        fg6: props.grow === 6,
        fs1: props.shrink === true || props.shrink === 1,
        fs2: props.shrink === 2,
        fs3: props.shrink === 3,
        fs4: props.shrink === 4,
        fs5: props.shrink === 5,
        fs6: props.shrink === 6,
        avc: props.alignVertically == 'center',
        avb: props.alignVertically == 'bottom',
        ahc: props.alignHorizontally == 'center',
        ahr: props.alignHorizontally == 'right',
        pad: props.pad,
        mrg: props.margin,
    }

    return cls
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';

ai-content {
    /** Default styles */

    > p {
        margin: 0;
        padding: 0;
    }

    > p:not(:last-child) {
        padding-bottom: 0.6em;
    }

    > h1 {
        font-size: 1.25rem;
        margin: 0;

        margin-bottom: 1.1rem;
        padding-bottom: 0;
        &:not(:first-child) {
            margin-top: 0.6em;
        }
    }

    > h2 {
        font-size: 1.1rem;
        margin: 0;
        padding-bottom: 0;
        &:not(:first-child) {
            margin-top: 0.5em;
        }
    }

    > h3 {
        font-size: 1rem;
        line-height: 1.125;
        margin: 0;
        padding-bottom: 0;
        &:not(:first-child) {
            margin-top: 0.4em;
        }
    }

    > h4 {
        font-size: 0.9rem;
        margin: 0;

        margin-bottom: 0.2em;
        padding-bottom: 0;

        &:not(:first-child) {
            margin-top: 0.8em;
        }

        &:first-child {
            margin-top: -0.5em;
        }
    }

    > h5 {
        font-size: 0.75rem;
        margin: 0;
        font-weight: 700;
        padding-bottom: 0.3em;
        &:not(:first-child) {
            margin-top: 0.3em;
        }
    }

    > h6 {
        font-size: 0.75rem;
        margin: 0;
        font-weight: 400;
        padding-bottom: 0.3em;
        &:not(:first-child) {
            margin-top: 0.3em;
        }
    }

    > ul,
    > ol {
        padding-left: 3em;
    }

    > ul {
        list-style-type: circle;
    }

    code {
        background-color: whitesmoke;
        color: theme.$primary;
        font-weight: normal;
        padding: 0 calc(#{theme.$default-content-padding} * 0.25);
    }

    a {
        color: theme.$default-link-color;
        text-decoration: none;
        font-weight: 500;

        &:hover {
            text-decoration: underline;
        }

        > i {
            padding-right: calc(#{theme.$default-content-padding} * 0.25);
        }
    }

    > button + p {
        padding-top: theme.$default-content-padding;
    }

    > ol + h5 {
        padding-top: theme.$default-content-padding;
    }

    &.fg1 {
        flex-grow: 1;
    }

    &.fg2 {
        flex-grow: 2;
    }

    &.fg3 {
        flex-grow: 3;
    }

    &.fg4 {
        flex-grow: 4;
    }

    &.fg5 {
        flex-grow: 5;
    }

    &.fg6 {
        flex-grow: 6;
    }

    &.fs1 {
        flex-shrink: 1;
    }

    &.fs2 {
        flex-shrink: 2;
    }

    &.fs3 {
        flex-shrink: 3;
    }

    &.fs4 {
        flex-shrink: 4;
    }

    &.fs5 {
        flex-shrink: 5;
    }

    &.fs6 {
        flex-shrink: 6;
    }

    &.pad {
        padding: theme.$default-content-padding;
    }

    &.mrg {
        margin: 0.6em;
    }

    &.avc {
        align-self: center;
    }
    &.avb {
        align-self: flex-end;
    }

    &.ahc {
        justify-content: center;
    }
    &.ahr {
        justify-content: flex-end;
    }

    &.has-text-danger {
        color: theme.$danger;
    }
}
</style>
