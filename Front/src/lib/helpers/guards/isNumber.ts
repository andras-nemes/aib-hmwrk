/**
 * Returns true if the given value is a valid number.
 * @param value Value that is checked
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value)
}
