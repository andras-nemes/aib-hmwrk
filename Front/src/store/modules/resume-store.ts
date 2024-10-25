import { ErrorMessageActions } from 'misc/constants'
import { signalError } from 'store/helpers/signalError'
import { StoreModule } from 'store/root-store/definition'
import { prop, sortBy } from 'ramda'

import type { Resume } from 'types/Resume'
import { useHomeworkApi } from 'lib/api/helpers/useApi'

type Getters = {
    /** Returns a single resume by its id */
    getResumeById: (id: number) => Resume | null
}

type State = {
    /** List of resumes with metadata */
    resumes: Resume[]
}

enum Mutations {
    SET = 'SET_RESUMES',
}

enum Actions {
    Fetch = 'FetchResumes',
}

export const resumes = StoreModule<State, Getters>({
    state: {
        resumes: [],
    },

    mutations: {
        /** Replace resumes in state, sorting them by name */
        [Mutations.SET](state, data: Resume[]) {
            state.resumes = sortBy(prop('SortOrder'))(data)
        },
    },

    getters: {
        getResumeById: state => id => state.resumes.find(el => el.ResumeId === id) || null,
    },

    actions: {
        /** Loads resumes from backend to state */
        [Actions.Fetch]: async function ({ dispatch, commit }) {
            try {
                const data = await useHomeworkApi().resume.get()
                commit(Mutations.SET, data)
            } catch (error) {
                await signalError(dispatch, error, 'Resumes', ErrorMessageActions.Fetch)
                throw error
            }
        },
    },
})

export type ResumeState = State
export type ResumeGetters = Getters
export { Actions as ResumeActions }
