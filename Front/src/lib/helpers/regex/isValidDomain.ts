/**
 * Domain Name Validation RegEx
 * Returns if input is valid domain or not
 * - First group matches sub domains or domain name with country top level domain like co.uk
 * - Second group matches domain name and TLD or TLD with Country TLD
 * @param domain name to validate
 */
export function isValidDomain(domain: string | null | undefined): boolean {
    if (!domain) {
        return false
    }

    const regex = /^(?!:\/\/)([a-zA-Z0-9-]+\.){0,4}[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,64}?$/gi

    return regex.test(domain)
}
