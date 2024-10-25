import { sumPropertyValue } from '../sumPropertyValue'
import { describe, test, expect } from 'vitest'

describe('sumPropertyValue helper', () => {
    test('Cumulative sum of numeric property "a" from an array of objects', () => {
        expect(
            sumPropertyValue(
                [
                    { a: 1, b: 100 },
                    { b: 90, a: 5 },
                ],
                'a'
            )
        ).toBe(6)

        expect(
            sumPropertyValue(
                [
                    { a: 1.23, b: 100 },
                    { b: 90, a: 5 },
                ],
                'a'
            )
        ).toBe(6.23)
    })

    test('Cumulative sum of numeric property "a" from an array of objects containing NaN values', () => {
        expect(
            sumPropertyValue(
                [
                    { a: 1.1, b: 100 },
                    { b: 90, a: undefined },
                    { b: 90, a: 3 },
                ],
                'a'
            )
        ).toBe(4.1)

        expect(
            sumPropertyValue(
                [
                    { a: '600', b: 100 },
                    { a: {} },
                    { a: 5 },
                    { a: [], b: 100 },
                    { a: NaN },
                    { a: 8 },
                ],
                'a'
            )
        ).toBe(13)
    })
})
