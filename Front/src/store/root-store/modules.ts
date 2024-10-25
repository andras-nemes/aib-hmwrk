import type { AppState, AppGetters } from 'store/modules/app-store'
import { app } from 'store/modules/app-store'

import type { ResumeState, ResumeGetters } from 'store/modules/resume-store'
import { resumes } from 'store/modules/resume-store'

export const modules = {
    app,
    resumes,
}

export type RootState = {
    app: AppState
    resumes: ResumeState
}

export type RootGetters = AppGetters & ResumeGetters
