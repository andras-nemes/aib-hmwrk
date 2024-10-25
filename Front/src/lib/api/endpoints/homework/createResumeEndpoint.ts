import type { RequestMaker } from 'lib/api/RequestMaker'

import type { Resume } from 'types/Resume'
import type { Get } from 'lib/api/types/Crud'

export interface ResumeEndpoint {
    get: Get<Resume[]>
}

export function createResumeEndpoint(requestMaker: RequestMaker): ResumeEndpoint {
    return {
        get: () => requestMaker.get('resumes/all'),
    }
}
