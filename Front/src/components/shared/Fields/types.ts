export type DropdownItem = Record<string, number | string | boolean | null | undefined> | string
export type DropdownItems = DropdownItem[] | null
export interface DateObject {
    day?: number
    month?: number
    year?: number
}
