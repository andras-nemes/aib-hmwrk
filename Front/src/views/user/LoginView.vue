<script lang="ts">
import { LoginPageMode } from 'components/shared/Login.vue'
import Login from 'components/shared/Login.vue'
import { StorageKey } from 'misc/constants'
import { saveSessionStorageItem } from 'lib/helpers'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'

interface Data {
    /** Page titles for login and warning */
    titles: Record<LoginPageMode, string>
    /** Page descriptions for login and warning */
    descriptions: Record<LoginPageMode, string>
}

/**
 * Extracts the URL search param value directly from 'search' property
 * or parsed from the 'hash' property.
 *
 * @param currentLocation Current location (URL)
 */
function extractSearchParam(currentLocation: Location): string | null {
    if (currentLocation.search) {
        return currentLocation.search
    }

    return currentLocation.hash.split('?')?.[1] || null
}

/**
 * Page for welcoming the unauthenticated user or signaling authentication error.
 */
export default defineComponent({
    name: 'LoginView',

    extends: Login,

    props: {
        pageMode: {
            type: Number as PropType<LoginPageMode>,
            default: LoginPageMode.Login,
        },
    },
    data(): Data {
        return {
            titles: {
                [LoginPageMode.Login]: 'HW',
                [LoginPageMode.NotAuthorised]: 'No Access',
            },
            descriptions: {
                [LoginPageMode.Login]: 'Homework',
                [LoginPageMode.NotAuthorised]:
                    'It seems you do not have access to some of the data you tried to request. Try to authenticate with another account or request support from Aibidia and try again later.',
            },
        }
    },

    mounted() {
        const searchParam = extractSearchParam(location)
        if (searchParam) {
            saveSessionStorageItem(StorageKey.UrlSearchParam, searchParam)
        }
    },

    methods: {
        onHomeClicked(): void {
            window.location.href = this.$store.getters.getPlatformLink
        },
    },
})
</script>
