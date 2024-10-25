<template>
    <Pane
        class="a-breadcrumbs"
        columns
    >
        <div
            v-if="showPageIcon"
            class="icon"
        >
            <i
                class="fas fa-2x fa-fw"
                :class="breadcrumbIcon"
            />
        </div>

        <Pane
            rows
        >
            <h1
                v-if="$route && showPageTitle"
                class="page-title"
            >
                <span>{{ breadcrumbTitle }}</span>
            </h1>
        </Pane>
        <slot />
    </Pane>
</template>

<script setup lang='ts'>
/**
 * Component to display navigation path (breadcrumb) for user.
 * This component is used as a template for VueBreadcrumb component.
 */
import type { BreadcrumbItem } from './BreadcrumbType'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Pane from '../PaneLayout.vue'

export interface Props {
    /** Flag to show page title */
    showPageTitle?: boolean
    /** Flag to show page icon */
    showPageIcon?: boolean
}

withDefaults(defineProps<Props>(), {
    showPageTitle: true,
    showPageIcon: true,
})

const route = useRoute()
const { t } = useI18n()

/** Compute the last breadcrumb title. */
const breadcrumbTitle = computed<string>(() => {
    if (!route) {
        return 'Unknown'
    }

    const breadcrumbs = route.meta?.breadcrumb as BreadcrumbItem[]
    if (!breadcrumbs || breadcrumbs.length === 0 || !route.matched.length) {
        return ''
    }

    // Route.matched structure in most solutions: [solution name, sidebar section, sidebar item, (sidebar subitem), (tab)]
    // Title structure: sidebar item(- sidebar subitem)

    // Use third crumb as the initial title if it exists, default to the last crumb if not.
    const matchedItem = route.matched[2] || route.matched[route.matched.length - 1]
    const initialCrumbName = (matchedItem.meta.breadcrumb as BreadcrumbItem[])[0].name

    const reduceInit = [t(initialCrumbName)]

    // Display the following matches if they have children (i.e. they are a subsection of an item).
    const matchedSlice = route.matched.slice(3)
    const nameArray = matchedSlice.reduce((acc, match) => {
        if (match.children.length) {
            const crumbName = (match.meta.breadcrumb as BreadcrumbItem[])[0].name
            acc.push(t(crumbName))
        }

        return acc
    }, reduceInit)

    return nameArray.join(' - ')
})

/** Compute the last breadcrumb icon. */
const breadcrumbIcon = computed<string>(() => {
    if (!route) {
        return ''
    }

    const breadcrumbs = route.meta?.breadcrumb as BreadcrumbItem[]
    if (!breadcrumbs || breadcrumbs.length === 0) {
        return ''
    }

    return breadcrumbs[breadcrumbs.length - 1].icon || ''
})
</script>

<style lang="scss">
@use '~@/assets/sass/theme';
@use '~@/assets/sass/mixins';

.a-breadcrumbs {
    display: flex;
    align-items: center;
    text-wrap: nowrap;
    overflow: hidden;

    > .icon {
        margin-right: calc(#{theme.$default-padding});
        color: theme.$page-breadcrumb-icon-color;
    }

    .page-title {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 1.3rem;
        font-weight: 700;
        letter-spacing: 0;
    }

    &.mobile {
        .page-title {
            font-size: 1rem;
        }
    }
}
</style>
