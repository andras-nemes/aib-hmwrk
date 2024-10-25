/** Error message returned from backend */
export interface ErrorMessage {
    /** Failed validations */
    ModelState?: Record<string, unknown>
    /** General error message */
    Message?: string
}

/**
 * Custom error when http response from fetch is not ok
 */
export interface HttpResponseError {
    /** Http error status, like 400 or 500 */
    status: number
    /** Http error status text, like Bad Request */
    statusText: string
    /** Error message returned from backend */
    message?: ErrorMessage | string
}
