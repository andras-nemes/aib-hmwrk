/**
 * Interface for tracking data loads, and displaying progress on UI.
 */
export interface DataLoadingObject {
    /** Unique ID for this DataFetch */
    key: string
    /** Optional description for debugging */
    desc: string
    /** Are we done? */
    ok?: boolean
    /** Did we encounter error? */
    err?: Error
}
