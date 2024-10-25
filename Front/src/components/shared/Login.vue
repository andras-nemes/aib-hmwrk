<template>
    <a-fullscreen-layout class="app-loader background-brand">
        <template #home-button>
            <a-button
                icon="fas fa-home"
                @click="onHomeClicked"
            >
                <span>Home</span>
            </a-button>
        </template>
        <template #slogan>
            {{ titles[pageMode] }}
        </template>
        <template #description>
            <span>{{ descriptions[pageMode] }}</span>
        </template>
        <template #actions>
            <a-field-layout no-label-element>
                <PrimaryButton
                    icon="fas fa-caret-right"
                    icon-align="right"
                    @click="loginRedirect"
                >
                    <span>Sign in</span>
                </PrimaryButton>
            </a-field-layout>
        </template>
    </a-fullscreen-layout>
</template>

<script lang="ts">
import FullscreenLayout from './FullscreenLayout.vue'
import FieldLayout from 'components/shared/FieldLayout.vue'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import PrimaryButton from './shared/PrimaryButton.vue'

export enum LoginPageMode {
    Login,
    NotAuthorised,
}

export interface Data {
    /** Page titles for login and warning */
    titles: Record<LoginPageMode, string>
    /** Page descriptions for login and warning */
    descriptions: Record<LoginPageMode, string>
}

export interface Props {
    pageMode: LoginPageMode
}

export interface Methods {
    /** Redirects user to MSAL signin page */
    loginRedirect: () => void
}

/** Page for welcoming the unauthenticated user or signaling authentication error */
export default defineComponent({
    components: {
        'a-fullscreen-layout': FullscreenLayout,
        'a-field-layout': FieldLayout,
        PrimaryButton,
    },

    props: {
        pageMode: {
            type: Number as PropType<LoginPageMode>,
            default: LoginPageMode.Login,
        },
    },

    data(): Data {
        return {
            titles: {
                [LoginPageMode.Login]: 'Solution abbreviation',
                [LoginPageMode.NotAuthorised]: 'No Access',
            },
            descriptions: {
                [LoginPageMode.Login]: 'Full solution name',
                [LoginPageMode.NotAuthorised]:
                    'It seems you do not have access to some of the data you tried to request. Try to authenticate with another account or request support from Aibidia and try again later.',
            },
        }
    },

    methods: {
        /** Redirects user to MSAL signin page */
        loginRedirect(): void {
            // Override in extending component
        },
        onHomeClicked(): void {
            // Override in extending component
        },
    },
})
</script>
