import { isNumber } from '../isNumber'
import { describe, test, expect } from 'vitest'

describe('isNumber type guard', () => {
    test('True when input is number', () => {
        expect(isNumber(2)).toBe(true)
        expect(isNumber(2.34)).toBe(true)
        expect(isNumber(0)).toBe(true)
        expect(isNumber(-100)).toBe(true)
    })

    test('False when input is NOT number', () => {
        expect(isNumber('2')).toBe(false)
        expect(isNumber([2.34])).toBe(false)
        expect(isNumber(NaN)).toBe(false)
        expect(isNumber({ 2: 10 })).toBe(false)
    })
})
