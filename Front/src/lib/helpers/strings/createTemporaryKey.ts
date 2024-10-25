/**
 * Use the input parameters to generate the key, For example, input key1, key2 then return key1-key2.
 * @param keys List of fragment keys
 */
export function createTemporaryKey(...keys: Array<string | number>): string {
    return keys.join('-')
}
