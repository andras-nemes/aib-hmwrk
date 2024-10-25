import type Vue from 'vue'
import type { NavigationGuard } from 'vue-router'

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        beforeRouteLeave?: NavigationGuard
    }
}
