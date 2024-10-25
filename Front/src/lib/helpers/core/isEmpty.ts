type EmptyValue = '' | null | undefined

/**
 * Checks that a value is empty
 * @param value Value to check
 */
export function isEmpty(value: unknown): value is EmptyValue {
    return value === '' || value === null || value === undefined
}
