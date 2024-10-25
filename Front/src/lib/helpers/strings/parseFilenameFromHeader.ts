/**
 * Tries to parse filename from 'Content-Disposition' response header using either utf8 or ascii format.
 *
 * @param headerValue Header value, e.g. 'attachment; filename="foo.zip"'
 * @returns Parsed filename or empty string if cannot parse.
 */
export function parseFilenameFromHeader(headerValue: string | null): string {
    if (!headerValue) {
        return ''
    }

    try {
        const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-.]+)(?:; ?|$)/i
        const asciiFilenameRegex = /filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i

        const utf8Test = utf8FilenameRegex.exec(headerValue)
        if (utf8Test) {
            return decodeURIComponent(utf8Test[1])
        } else {
            const matches = asciiFilenameRegex.exec(headerValue)
            if (matches != null && matches[2]) {
                return decodeURIComponent(matches[2])
            }
        }

        return ''
    } catch (err: unknown) {
        return ''
    }
}
