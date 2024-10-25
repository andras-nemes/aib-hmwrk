import { getErrorMsgAndType } from '../getErrorMsgAndType'
import { describe, test, expect } from 'vitest'

describe('getErrorMsgAndType', () => {
    test('returns 404 error', () => {
        const inputError = {
            status: 404,
            message: {
                Message: 'bad error',
            },
        }

        expect(getErrorMsgAndType(inputError, 'foo', 'bar')).toStrictEqual({
            snackbarMsg: 'foo not found.',
            snackbarType: 'Error',
        })
    })

    test('returns 415 error', () => {
        const inputError = {
            status: 415,
            statusText: 'Unsupported Media Type',
            message: 'Supported types: pdf, docx, jpg.',
        }

        expect(getErrorMsgAndType(inputError, 'att', 'upsert')).toStrictEqual({
            snackbarMsg: 'Unsupported Media Type error 415. Supported types: pdf, docx, jpg.',
            snackbarType: 'Error',
        })
    })

    test('just throws by proxying the error', () => {
        expect(() => {
            getErrorMsgAndType(new Error('bad error'), 'foo', 'bar')
        }).toThrow('bad error')
    })

    test('returns unrecognized error as stringified', () => {
        const inputError = {
            status: 400,
            foo: 'bar',
        }

        expect(getErrorMsgAndType(inputError, 'foo', 'bar')).toStrictEqual({
            snackbarMsg: 'Unexpected error 400 in bar foo.',
            snackbarType: 'Error',
        })
    })

    test('constructs error based on model state', () => {
        const inputError = {
            status: 400,
            message: {
                ModelState: {
                    foo: 'bar',
                    sun: 'star',
                },
            },
        }

        expect(getErrorMsgAndType(inputError, 'simpleType', 'simpleAction')).toStrictEqual({
            snackbarMsg: 'simpleType: bar; star',
            snackbarType: 'Error',
        })
    })

    test('constructs error based on simple message', () => {
        const inputError = {
            status: 400,
            message: {
                Message: 'foo',
            },
        }

        expect(getErrorMsgAndType(inputError, 'simpleType', 'simpleAction')).toStrictEqual({
            snackbarMsg: 'foo',
            snackbarType: 'Error',
        })
    })

    test('constructs unrecognized error (but does not throw because data key was still provided', () => {
        const inputError = {
            status: 400,
            message: {
                message: 'foo',
            },
        }

        expect(getErrorMsgAndType(inputError, 'simpleType', 'simpleAction')).toStrictEqual({
            snackbarMsg: 'Unexpected error 400 in simpleAction simpletype.',
            snackbarType: 'Error',
        })
    })
})
