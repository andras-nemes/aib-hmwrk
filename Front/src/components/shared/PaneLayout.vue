<template>
    <component
        :is="tagName"
        v-if="!simpleContent"
        :class="paneClass"
        @click="($event: Event) => emit('click', $event)"
        @mouseover="($event: Event) => emit('mouseover', $event)"
        @mouseleave="($event: Event) => emit('mouseleave', $event)"
    >
        <Tabs v-if="slots.tabs">
            <slot name="tabs" />
        </Tabs>
        <slot name="theheader">
            <header v-if="slots.header">
                <slot name="header" />
            </header>
        </slot>
        <slot name="content">
            <ContentLayout
                :scrollable="scrollable"
                :class="{ columns: columns }"
                @scroll="$event => emit('scroll', $event)"
            >
                <slot />
            </ContentLayout>
        </slot>
        <footer v-if="slots.footer">
            <slot name="footer" />
        </footer>
        <slot name="overlay" />
        <slot name="loader">
            <LoadingIndicator
                v-if="hasLoader"
                :active="loading"
            ></LoadingIndicator>
        </slot>
    </component>
    <component
        :is="tagName"
        v-else
        class="simple"
        :class="paneClass"
        @click="($event: Event) => emit('click', $event)"
        @mouseover="($event: Event) => emit('mouseover', $event)"
        @mouseleave="($event: Event) => emit('mouseleave', $event)"
    >
        <Tabs v-if="slots.tabs">
            <slot name="tabs" />
        </Tabs>
        <slot />
        <slot name="overlay" />
        <slot name="loader">
            <LoadingIndicator
                v-if="hasLoader"
                :active="loading"
            ></LoadingIndicator>
        </slot>
    </component>
</template>


<script lang="ts" setup>
/**
 * This is the default layout component, which can be used similar to flex-box layout in CSS.
 *
 * Component to display threefold vertical layout in slots: header, content/default and footer.
 * Content can be set to scroll when going out of bounds by prop scrollable.
 */
import ContentLayout from './ContentLayout.vue'
import Tabs from './Tabs/Tabs.vue'
import LoadingIndicator from './Loader/LoadingIndicator.vue'
import { computed, useSlots } from 'vue'

export interface Props {
    /** Do we add card to the Pane */
    hasLoader?: boolean
    /** If we are loading this pane */
    loading?: boolean
    /** If the content should be scrollable */
    scrollable?: boolean
    /** If the layout should be rows */
    rows?: boolean
    /** If the layout should be columns */
    columns?: boolean
    /** If the layout should be grid */
    grid?: boolean
    /** If the layout should be similar to a card in regards of padding and margins*/
    card?: boolean
    /** Is there border around the pane */
    bordered?: boolean
    /** Do we round the borders of the pane */
    rounded?: boolean
    /** How deep the shadow effect should be? 0-12. Default is 0. */
    depth?: number
    /** How much this can grow? 0-4. Null (no grow) flex-grow: N. Default is 1. */
    grow?: number | null
    /** How much this can shrink? 0-4. Default null (no shrink) flex-shrink: N */
    shrink?: number | null
    /** What color of background should the pane have? */
    background?: string | null
    /** Do we add content padding? Card has default content padding, otherwise default is false */
    contentPadding?: boolean | null
    /** Do we separate content child elements? default is false */
    contentSeparation?: boolean
    /** Do we grow content automatically to fill the necessary size? flex-grow: 1 */
    contentGrow?: boolean
    /** Content flex justification? justify-content:  */
    justifyContent?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly'
        | null
    /** Items flex alignment? align-content:  */
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | null
    /** Do we wrap items automatically to if space is not enough? flex-wrap: wrap */
    wrapItems?: boolean
    /** Do we show debug information */
    debug?: boolean
}

export interface PaneClasses {
    background?: boolean
    white?: boolean
    pad?: boolean
    debug?: boolean
    separate?: boolean
    rounded?: boolean
    columns?: boolean
    'is-scrollable'?: boolean
    'is-grid'?: boolean
    'is-bordered'?: boolean
    'has-tabs'?: boolean
    'pad-content'?: boolean
    'depth-8'?: boolean
    'depth-12'?: boolean
    'content-grow'?: boolean
    'flex-grow-0'?: boolean
    'flex-grow-1'?: boolean
    'flex-grow-2'?: boolean
    'flex-grow-3'?: boolean
    'flex-grow-4'?: boolean
    'flex-shrink-0'?: boolean
    'flex-shrink-1'?: boolean
    'flex-shrink-2'?: boolean
    'flex-shrink-3'?: boolean
    'flex-shrink-4'?: boolean
    'flex-wrap'?: boolean
    // Flex Justifying classes
    'flex-jcs'?: boolean
    'flex-jce'?: boolean
    'flex-jcc'?: boolean
    'flex-jcsb'?: boolean
    'flex-jcsa'?: boolean
    'flex-jcse'?: boolean

    // Flex Align classes
    'flex-ais'?: boolean
    'flex-aie'?: boolean
    'flex-aic'?: boolean
    'flex-aib'?: boolean
    'flex-aist'?: boolean
}

interface Emits {
    (e: 'click', $event: Event): void
    (e: 'mouseover', $event: Event): void
    (e: 'mouseleave', $event: Event): void
    (e: 'scroll', $event: Event): void
    (e: 'click', $event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
    hasLoader: false,
    loading: false,
    scrollable: false,
    rows: false,
    columns: false,
    grid: false,
    card: false,
    bordered: false,
    rounded: false,
    depth: 0,
    grow: 1,
    shrink: null,
    background: null,
    contentPadding: null,
    contentSeparation: undefined,
    contentGrow: false,
    wrapItems: false,
    debug: false,
    justifyContent: null,
    alignItems: null,
})

const emit = defineEmits<Emits>()
const slots = useSlots()

/** What tag to render as element */
const tagName = computed<string>(() => {
    if (props.card) {
        return 'ai-card'
    }

    if (props.columns) {
        return 'ai-columns'
    }

    if (props.rows) {
        return 'ai-rows'
    }

    return 'ai-pane'
})

/** Do we build more complex layout */
const simpleContent = computed<boolean>(() => {
    return (
        !slots.theheader &&
        !slots.header &&
        !slots.content &&
        !slots.footer &&
        !props.scrollable &&
        !hasTabs.value &&
        !props.grid
    )
})

/** Does Pane have tabs? */
const hasTabs = computed<boolean>(() => !!slots.tabs)

/** Do we pad content? */
const padContent = computed(
    () => props.contentPadding === true || (props.depth > 0 && props.contentPadding !== false)
)

/** Calculated Pane classes */
const paneClass = computed(() => {
    const cls: PaneClasses = {
        'is-scrollable': props.scrollable,
        'is-grid': props.grid,
        'is-bordered': props.bordered,
        'has-tabs': hasTabs.value,
        'content-grow': props.contentGrow,
        'flex-grow-0': props.grow === 0,
        'flex-grow-1': props.grow === 1,
        'flex-grow-2': props.grow === 2,
        'flex-grow-3': props.grow === 3,
        'flex-grow-4': props.grow === 4,
        'flex-shrink-0': props.shrink === 0,
        'flex-shrink-1': props.shrink === 1,
        'flex-shrink-2': props.shrink === 2,
        'flex-shrink-3': props.shrink === 3,
        'flex-shrink-4': props.shrink === 4,
        'flex-wrap': props.wrapItems,
        'flex-jcs': props.justifyContent === 'flex-start',
        'flex-jce': props.justifyContent === 'flex-end',
        'flex-jcc': props.justifyContent === 'center',
        'flex-jcsb': props.justifyContent === 'space-between',
        'flex-jcsa': props.justifyContent === 'space-around',
        'flex-jcse': props.justifyContent === 'space-evenly',
        'flex-ais': props.alignItems === 'flex-start',
        'flex-aie': props.alignItems === 'flex-end',
        'flex-aic': props.alignItems === 'center',
        'flex-aib': props.alignItems === 'baseline',
        'flex-aist': props.alignItems === 'stretch',
        'pad-content': !simpleContent.value && padContent.value,
        columns: simpleContent.value && props.card && props.columns,
        pad: simpleContent.value && padContent.value,
        separate: props.contentSeparation,
        rounded: props.rounded,
        debug: props.debug,
    }

    if (props.depth > 0) {
        cls['depth-12'] = props.depth === 12
        cls['depth-8'] = props.depth === 8
    }

    if (props.background === 'white') {
        cls.white = true
    }

    return cls
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';

ai-rows,
ai-columns,
ai-card,
ai-pane {
    $flex-classes: 4;

    @for $i from 0 through $flex-classes {
        &.flex-grow-#{$i} {
            flex-grow: $i;
        }

        &.flex-shrink-#{$i} {
            flex-shrink: $i;
        }
    }

    &.content-grow {
        &.simple:not(.flex-grow-0),
        > ai-scrollwrapper > ai-scroll > ai-content:not(.flex-grow-0),
        > ai-content:not(.flex-grow-0) {
            flex-grow: 1;
        }

        > ai-scrollwrapper > ai-scroll {
            display: flex;
            flex-direction: column;
        }
    }

    &.relative {
        position: relative;

        > ai-content {
            position: relative;
        }
    }

    > ai-scrollwrapper {
        position: relative;
        flex-grow: 1;
        > ai-scroll {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: auto;

            > ai-content {
                display: flex;
                flex-direction: column;
            }
        }
    }

    > ai-scrollwrapper.columns {
        > ai-scroll {
            > ai-content {
                flex-direction: row;
            }
        }
    }

    &.flex-wrap {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            flex-wrap: wrap;
        }
    }

    &.flex-jcs {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            justify-content: flex-start;
        }
    }
    &.flex-jcc {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            justify-content: center;
        }
    }
    &.flex-jce {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            justify-content: flex-end;
        }
    }
    &.flex-jcsb {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            justify-content: space-between;
        }
    }
    &.flex-jcsa {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            justify-content: space-around;
        }
    }
    &.flex-jcse {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            justify-content: space-evenly;
        }
    }

    &.flex-ais {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            align-items: flex-start;
        }
    }
    &.flex-aic {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            align-items: center;
        }
    }
    &.flex-aie {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            align-items: flex-end;
        }
    }
    &.flex-aib {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            align-items: baseline;
        }
    }
    &.flex-aist {
        &.simple,
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            align-items: stretch;
        }
    }

    &.separate > ai-scrollwrapper > ai-scroll > ai-content,
    &.separate > ai-field-group,
    &.separate > ai-content:not(.typography),
    &.separate {
        > p,
        > ai-field {
            padding: calc(#{theme.$default-padding} * 0.5);
            margin: calc(#{theme.$default-padding} * 0.5);
        }

        > ai-card {
            margin: calc(#{theme.$default-padding} * 0.5);
        }

        > ai-tabs {
            padding: 0 calc(#{theme.$default-padding} * 0.5);
        }
    }

    &.separate > ai-content.typography {
        padding: calc(#{theme.$default-padding} * 0.5);
        margin: calc(#{theme.$default-padding} * 0.5);
    }

    > ai-controlbar {
        display: inline-flex;
        flex-direction: row;
        min-width: 0;
        align-items: center;

        margin-top: calc(#{theme.$default-padding} * 0.5);
        margin-bottom: calc(#{theme.$default-padding} * 0.5);

        &.flex-grow-1 {
            flex-grow: 1;
        }

        > * {
            margin-right: calc(#{theme.$default-padding} * 0.5);
            margin-left: calc(#{theme.$default-padding} * 0.5);
        }

        > .a-button {
            flex-shrink: 1;
        }

        @include mixins.smallerThanSmallDesktop {
            > * {
                margin-right: calc(#{theme.$default-padding} * 0.175);
                margin-left: calc(#{theme.$default-padding} * 0.175);
            }
        }
    }

    &.pad {
        padding: theme.$default-content-padding;
    }

    &.pad-content {
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content {
            padding: theme.$default-content-padding;
        }
    }

    > footer {
        display: flex;
        flex-direction: column;
        flex-shrink: 1;
    }

    &.is-grid {
        > ai-scrollwrapper > ai-scroll > ai-content,
        > ai-content:not(ai-pane):not(ai-card) {
            display: grid;
            flex-grow: 1;
        }
    }

    &.white {
        background: theme.$card-bg;
    }

    &.bordered {
        border-right: 1px solid theme.$default-border-color;
        border-left: 1px solid theme.$default-border-color;
        &:not(.top-paper) {
            border-bottom: 1px solid theme.$default-border-color;
            border-top: 1px solid theme.$default-border-color;
        }
    }

    $border-radius: theme.$card-border-radius;

    &.rounded {
        border-radius: $border-radius;

        > ai-card,
        > ai-pane {
            border-radius: $border-radius;
        }

        > footer,
        > footer > *:last-child {
            border-bottom-right-radius: $border-radius;
            border-bottom-left-radius: $border-radius;
        }

        &:not(.has-tabs) {
            > header,
            > header > *:first-child {
                border-top-right-radius: $border-radius;
                border-top-left-radius: $border-radius;
            }

            > ai-scrollwrapper,
            > ai-scrollwrapper > ai-scroll {
                border-radius: $border-radius;
            }
        }

        &.has-tabs {
            > ai-scrollwrapper,
            > ai-scrollwrapper > ai-scroll {
                border-bottom-right-radius: $border-radius;
                border-bottom-left-radius: $border-radius;
            }
        }

        > ai-content:last-child > ai-pane > ai-content:last-child,
        > ai-content:last-child > ai-pane,
        > ai-content:last-child {
            border-bottom-right-radius: $border-radius;
            border-bottom-left-radius: $border-radius;
        }

        > ai-content:last-of-type
            > ai-pane:last-of-type
            > ai-content:last-of-type
            > .a-table-resizer {
            border-bottom-right-radius: $border-radius;
            border-bottom-left-radius: $border-radius;
        }

        > ai-pane > ai-overlay {
            border-top-right-radius: $border-radius;
            border-top-left-radius: $border-radius;
            border-bottom-right-radius: $border-radius;
            border-bottom-left-radius: $border-radius;
        }

        > ai-pane > ai-scrollwrapper ai-overlay,
        > ai-content > ai-pane > ai-overlay {
            border-bottom-right-radius: $border-radius;
            border-bottom-left-radius: $border-radius;
        }
    }

    &.has-tabs {
        > ai-tabs {
            > ai-tablist {
                > ai-tab {
                    border-top-right-radius: $border-radius;
                    border-top-left-radius: $border-radius;
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                }

                > ai-tab.is-active {
                    background-color: theme.$white;
                    color: theme.$primary;
                }
            }
        }
    }
}

ai-rows {
    > ai-scrollwrapper > ai-scroll > ai-content,
    & {
        display: flex;
        flex-direction: column;
    }
}

ai-card,
ai-pane {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;
    min-width: 0;

    > ai-content {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
    }

    > ai-content.columns {
        flex-direction: row;
    }

    > ai-scrollwrapper {
        @include mixins.smallerThanTablet {
            min-height: 320px;
        }
    }
}

ai-card {
    border: theme.$control-border;
}

ai-card {
    overflow: auto;
}

ai-card.columns,
ai-columns {
    > ai-scrollwrapper > ai-scroll > ai-content,
    & {
        display: flex;
        flex-direction: row;
    }
}

ai-rows.debug,
ai-columns.debug,
ai-card.debug,
ai-pane.debug {
    border: 1px solid red;
    > header {
        background-color: rgba($color: yellow, $alpha: 0.1) !important;
    }

    & {
        background-color: rgba($color: blue, $alpha: 0.1) !important;
    }

    > footer {
        background-color: rgba($color: green, $alpha: 0.1) !important;
    }
}

ai-rows.debug {
    &:after {
        font-size: 9px;
        content: 'ai-rows';
        position: absolute;
        bottom: 0px;
        left: 3px;
    }
}

ai-columns.debug {
    &:after {
        font-size: 9px;
        content: 'ai-columns';
        position: absolute;
        bottom: 0px;
        left: 3px;
    }
}
</style>
