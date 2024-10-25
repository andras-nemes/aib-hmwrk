import type { HomeworkApi } from 'lib/api/types/Api'

import { RequestMaker } from 'lib/api/RequestMaker'
import { createResumeEndpoint } from 'lib/api/endpoints/homework/createResumeEndpoint'

/**
 * Creates API endpoints for the application
 * @param apiBaseUri Uri for API
 */
export default function createAppApi(apiBaseUri: string): HomeworkApi {
    const requestMaker = new RequestMaker(apiBaseUri)

    return {
        resumes: createResumeEndpoint(requestMaker),
    }
}
