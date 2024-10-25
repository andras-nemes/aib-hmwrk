import { logActionDuration } from 'lib/helpers'
import { HttpResponseType } from 'misc/constants'
import { parseFilenameFromHeader } from 'lib/helpers/strings/parseFilenameFromHeader'

export class RequestMaker {
    readonly #apiBaseUri: string

    constructor(apiBaseUri: string) {
        this.#apiBaseUri = apiBaseUri
    }

    async get<T>(endpoint: string): Promise<T> {
        const trackerStart = performance.now()
        const headers = await this.prepareHeaders('application/json')
        const response = await fetch(`${this.#apiBaseUri}/${endpoint}`, { headers })
        await RequestMaker.checkResponseErrors(response)
        RequestMaker.trackResponseTime([trackerStart, `GET ${endpoint}`])
        return await RequestMaker.parseResponse(response)
    }

    async post<K, T>(
        endpoint: string,
        body?: K | Record<string, unknown> | FormData,
        isJson = true
    ): Promise<T> {
        const trackerStart = performance.now()
        const headers = await this.prepareHeaders()
        if (isJson) {
            headers.set('Content-Type', 'application/json')
        }

        const response = await fetch(`${this.#apiBaseUri}/${endpoint}`, {
            method: 'POST',
            body: isJson ? JSON.stringify(body) : (body as FormData),
            headers,
        })

        await RequestMaker.checkResponseErrors(response)
        RequestMaker.trackResponseTime([trackerStart, `POST ${endpoint}`])

        return await RequestMaker.parseResponse(response)
    }

    async delete<K>(endpoint: string): Promise<K> {
        const trackerStart = performance.now()
        const headers = await this.prepareHeaders()
        const response = await fetch(`${this.#apiBaseUri}/${endpoint}`, {
            method: 'DELETE',
            headers,
        })

        await RequestMaker.checkResponseErrors(response)
        RequestMaker.trackResponseTime([trackerStart, `DELETE ${endpoint}`])
        return await RequestMaker.parseResponse(response)
    }

    async put<K, T>(endpoint: string, body?: T): Promise<K> {
        const trackerStart = performance.now()
        const headers = await this.prepareHeaders('application/json')
        const response = await fetch(`${this.#apiBaseUri}/${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers,
        })

        await RequestMaker.checkResponseErrors(response)
        RequestMaker.trackResponseTime([trackerStart, `PUT ${endpoint}`])
        return await RequestMaker.parseResponse(response)
    }

    private static async parseResponse<T>(response: Response): Promise<T> {
        const responseTypeHeader = response.headers.get('content-type')
        let responseType = HttpResponseType.Text
        if (responseTypeHeader) {
            if (responseTypeHeader.includes('json')) {
                responseType = HttpResponseType.Json
            } else if (!responseTypeHeader.includes('text')) {
                // We consider blob to be everything else that is not json or text
                responseType = HttpResponseType.Blob
            }
        }

        if (responseType === HttpResponseType.Blob) {
            const blob = await response.blob()
            const filename = parseFilenameFromHeader(response.headers.get('content-disposition'))

            return (filename ? { blob, filename } : blob) as unknown as T
        } else if (responseType === HttpResponseType.Json) {
            return await response.json()
        }

        return (await response.text()) as unknown as T
    }

    private async prepareHeaders(contentType?: string): Promise<Headers> {
        const headers = new Headers()
        if (contentType) {
            headers.append('Content-Type', contentType)
        }

        return headers
    }

    private static async tryParseError(response: Response): Promise<unknown> {
        try {
            return await response.json()
        } catch {
            return ''
        }
    }

    private static async checkResponseErrors(response: Response): Promise<Response> {
        if (response.ok) {
            return response
        } else {
            throw {
                status: response.status,
                statusText: response.statusText,
                message: await RequestMaker.tryParseError(response),
            }
        }
    }

    private static trackResponseTime(tracker: [startTimestamp: number, event: string]): void {
        const trackerEnd = performance.now()
        logActionDuration([tracker[0], trackerEnd], tracker[1])
    }
}
