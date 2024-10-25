import type { Component } from 'vue'

export interface Props {
    /** Button loading state */
    loading?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Outlined button */
    outlined?: boolean
    /** Tooltip for the button */
    title?: string
    /** Whether icon is right, left or not shown at all (none) */
    iconAlign?: string
    /** Icon class (fa or fas class name) */
    icon?: string
    /** Icon component - overridden by class icon if both used */
    iconComponent?: Component
    /** Hyperlink to external source */
    href?: string
    /** Target blank if opening to new tab*/
    target?: '_blank'
}

export interface Emits {
    (e: 'click', event: Event): void
    (e: 'error', error: unknown): void
}

interface UsesButton {
    handleClick: (event: Event) => void
}

export const defaultProps = {
    loading: false,
    disabled: false,
    outlined: false,
    title: '',
    iconAlign: 'left',
}

export function useButton(props: Props, emit: Emits): UsesButton {
    function handleClick(event: Event): void {
        if (props.href) {
            window.open(props.href, props.target || undefined)
            return
        }

        emit('click', event)
    }

    return { handleClick }
}
