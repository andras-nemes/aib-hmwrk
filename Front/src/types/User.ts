export interface User {
    DatabaseId: number
    UserId: number
    AppCodes: string[]
}

/** Public information about a user */
export interface UserPublic {
    UserId: string
    Email: string
    ShortName: string
    FullName: string
    IsOnline: boolean
}
