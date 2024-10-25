import { signalError } from '../signalError'
import { ErrorMessageActions } from 'misc/constants'
import { vi, describe, test, expect } from 'vitest'

vi.mock('store/modules/app-store', () => {
    return {
        AppActions: {
            SetMsgAndShowSnackbar: '',
        },
    }
})

describe('signalError', () => {
    test('calls action and waits for it to return nothing', async () => {
        const dispatch = vi.fn((snackbar, errObj) => new Promise(res => res(errObj)))

        vi.stubGlobal('console', {
            log: vi.fn(), // console.log are ignored in tests
        })

        const res = await signalError(dispatch, 'error', 'subject', ErrorMessageActions.Fetch)

        expect(dispatch).toHaveBeenCalled()
        expect(res).toBe(undefined)
    })
})
