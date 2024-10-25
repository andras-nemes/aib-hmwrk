import { isValidDomain } from '../isValidDomain'
import { describe, test, expect } from 'vitest'

describe('isValidDomain', () => {
    test('input is valid domain', () => {
        expect(isValidDomain('nokia.com')).toBe(true)
        expect(isValidDomain('nokia.co.uk')).toBe(true)
        expect(isValidDomain('uk.nokia.com')).toBe(true)
        expect(isValidDomain('accounting.uk.nokia.com')).toBe(true)
        expect(isValidDomain('sub.division.accounting.uk.nokia.com')).toBe(true)
    })

    test('input is not valid domain', () => {
        expect(isValidDomain()).toBe(false)
        expect(isValidDomain(undefined)).toBe(false)
        expect(isValidDomain(null)).toBe(false)
        expect(isValidDomain('nokia')).toBe(false)
        expect(isValidDomain('https://nokia.com')).toBe(false)
        expect(isValidDomain('<a>some html input</a>')).toBe(false)
        expect(isValidDomain('sub.division.accounting.uk.nokia.---')).toBe(false)
        expect(isValidDomain('some.more.sub.domain.sub.division.accounting.uk.nokia.co.uk')).toBe(
            false
        )
    })
})
