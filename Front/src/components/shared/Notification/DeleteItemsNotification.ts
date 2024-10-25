export interface DeletedItem<T> {
    /** Unique identification number for this data object */
    Id: T
}

export interface Props {
    /** Datatype from which the items are removed from. */
    type: string

    /** Array of items which are being removed. */
    items: DeletedItem<number | string>[]
}

export interface Computed {
    /** Compute length of items array */
    count: number
}
