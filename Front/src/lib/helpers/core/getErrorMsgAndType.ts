import { SnackbarTypes } from 'misc/constants'
import type { ErrorMessage, HttpResponseError } from 'lib/api/types/HttpResponseError'

type ErrorMsgAndType = {
    snackbarMsg: string
    snackbarType: string
}

/** Custom type guard for checking if error is Http error */
function isHttpError(err: unknown): err is HttpResponseError {
    return !!(err as HttpResponseError).status
}

/** Custom type guard for checking if error message is an object returned from .NET */
function isErrMessage(message: unknown): message is ErrorMessage {
    return !!((message as ErrorMessage)?.Message || (message as ErrorMessage)?.ModelState)
}

/**
 * Parses error metadata from API response to a snackbar error message in the UI
 * @param error Error from backend response
 * @param type Entity that generated error
 * @param action Action that generated error, like Insert, or Update, or Delete
 */
export function getErrorMsgAndType(error: unknown, type: string, action: string): ErrorMsgAndType {
    // Default catch-all error message
    let msg =
        type && action
            ? `Unexpected error while ${action} ${type.toLowerCase()}`
            : 'Unexpected error'

    if (error instanceof Error) {
        // If error is not custom error, just throw as is without showing snackbar
        throw error
    }

    if (isHttpError(error)) {
        const serverMessage = error.message
        if (error.status === 404) {
            // If Not found, show custom text with entity name
            msg = `${type} not found.`
        } else if (error.status === 415) {
            // Custom message for unsupported media types. Should be shown when trying to upload wrong type of file
            msg = `Unsupported Media Type error ${error.status}. ${error.message}`
        } else if (isErrMessage(serverMessage) && serverMessage?.ModelState) {
            // If ASP.NET returned validation error object, concatenate all message errors and show as one error
            msg = `${type}: ${Object.keys(serverMessage.ModelState)
                .map(key => serverMessage?.ModelState?.[key] || '')
                .join('; ')}`
        } else if (isErrMessage(serverMessage) && serverMessage?.Message) {
            // If ASP.NET return validation error as a single Message, just show it
            msg = serverMessage.Message
        } else if (serverMessage && typeof serverMessage === 'string') {
            // Server returned error in body as text
            msg = serverMessage
        } else if (error.statusText) {
            // If backend returned statusText, just show it
            msg = error.statusText
        } else if (action && type) {
            // If entity type and action type are provided, include them in error
            msg = `Unexpected error ${error.status} in ${action} ${type.toLowerCase()}.`
        }
    }

    return {
        snackbarMsg: msg,
        snackbarType: SnackbarTypes.Error,
    }
}
