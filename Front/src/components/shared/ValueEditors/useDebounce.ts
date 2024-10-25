import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'
import { debounce } from 'lib/helpers/debounce'

interface UsesDebounce {
    /** Immediately emits an event that editors preferred size has been changed due some other event. */
    emitPreferredSize: () => void
    /**
     * Same as 'emitPreferredSize', but delays event propagation,
     * and debounces it to prevent event pollution.
     */
    emitDelayedPreferredSize: () => void
}

export interface DebounceEmits {
    (e: 'change-preferred-size'): void
}

export function useDebounce(emit: DebounceEmits): UsesDebounce {
    /** Debounce function to debounce emitPreferredSize */
    const debouncedEmitter: Ref<() => void> = ref(() => undefined)

    onMounted(() => {
        debouncedEmitter.value = debounce(
            () => {
                emitPreferredSize()
            },
            5, // time treshold
            false // immeadiate
        )
    })

    function emitPreferredSize(): void {
        emit('change-preferred-size')
    }

    function emitDelayedPreferredSize(): void {
        if (debouncedEmitter.value) {
            debouncedEmitter.value()
        }
    }

    return {
        emitPreferredSize,
        emitDelayedPreferredSize,
    }
}
