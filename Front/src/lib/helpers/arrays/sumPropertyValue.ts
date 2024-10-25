import { isNumber } from 'lib/helpers/guards/isNumber'

/**
 * Sum values of the given numeric property. Invalid values are excluded.
 * @param {Array<T>} array Array of object T
 * @param {string} property The name of the numeric property whose values are summed.
 * @return {number} The total sum
 */
export function sumPropertyValue<T>(array: Array<T>, property: keyof T): number {
    return array.reduce((sum, item) => {
        const value = item[property]
        if (value && isNumber(value)) {
            sum += value
        }

        return sum
    }, 0)
}
