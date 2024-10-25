import { globalApp } from 'src/main'
import type { HomeworkApi } from '../types/Api'

export function useHomeworkApi(): HomeworkApi {
    const api = globalApp?.config.globalProperties.$homeworkApi
    if (!api) {
        throw new Error('API not available')
    }

    return api
}
