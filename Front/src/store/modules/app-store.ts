import { StoreModule } from 'store/root-store/definition'

type Getters = {}

type State = {
    /** Should popup be shown at the moment */
    snackbarVisible: boolean
    /** Popup text message */
    snackbarMsg: string | null
    /** Popup type */
    snackbarType: string | null
    /** Should menu be sticky */
    menuIsSticky: boolean
    /** Set to false when data is loading or is loaded, true by default and on load error */
    shouldLoadInitialData: boolean
}

enum Actions {
    SetMsgAndShowSnackbar = 'SetMsgAndShowSnackbar',
}

enum Mutations {
    SET_SNACKBAR_MESSAGE = 'SET_SNACKBAR_MESSAGE',
    SHOW_SNACKBAR = 'SHOW_SNACKBAR',
    SET_SNACKBAR_TYPE = 'SET_SNACKBAR_TYPE',
    SET_MENU_STICKY_STATE = 'SET_MENU_STICKY_STATE',
    SET_SHOULD_LOAD_DATA = 'SET_SHOULD_LOAD_DATA',
}

export const app = StoreModule<State, Getters>({
    state: {
        snackbarVisible: false,
        snackbarMsg: null,
        snackbarType: null,
        menuIsSticky: true,
        shouldLoadInitialData: true
    },

    mutations: {
        /** Sets snackbar message */
        [Mutations.SET_SNACKBAR_MESSAGE](state, snackbarMsg: string) {
            state.snackbarMsg = snackbarMsg
        },

        /** Set snackbar visibility */
        [Mutations.SHOW_SNACKBAR](state, show: boolean) {
            state.snackbarVisible = show
        },

        /** Set snackbar type. */
        [Mutations.SET_SNACKBAR_TYPE](state, snackbarType: string) {
            state.snackbarType = snackbarType
        },
        /** Set solution side menu sticky state */
        [Mutations.SET_MENU_STICKY_STATE](state, value: boolean) {
            state.menuIsSticky = value
        },

        [Mutations.SET_SHOULD_LOAD_DATA](state: AppState, value: boolean): void {
            state.shouldLoadInitialData = value
        },
    },

    actions: {
        /** Initializes popup input and shows it with later automatic hiding */
        [Actions.SetMsgAndShowSnackbar]: async ({ commit }, { snackbarMsg, snackbarType }) => {
            commit(Mutations.SET_SNACKBAR_MESSAGE, snackbarMsg)
            commit(Mutations.SET_SNACKBAR_TYPE, snackbarType)
            commit(Mutations.SHOW_SNACKBAR, true)

            // Automatically hide popup after some time
            setTimeout(() => {
                commit(Mutations.SHOW_SNACKBAR, false)
            }, 8000)
        },
    },
})

export type AppState = State
export type AppGetters = Getters
export { Mutations as AppMutations }
export { Actions as AppActions }
