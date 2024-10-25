/*
 * A constant contain all the section route names in application
 */
const CategoryNames = {
    /** General endpoint. */
    General: 'General',
    /** Users endpoint */
    Users: 'Users',
} as const

/*
 * A constant contain all the general route names in application
 */
const GeneralViewNames = {
    Introduction: 'Introduction',
    ResumeTable: 'ResumeTable',
    ResumeForm: 'ResumeForm',
} as const

/*
 * A constant contain all the user route names in application
 */
const UserViewNames = {
    AibidiaPlatform: 'AibidiaPlatform',
    AibidiaSupport: 'AibidiaSupport',
    Logout: 'Logout',
    Login: 'Login',
    NoAccess: 'NoAccess',
} as const

/*
 * Constant object of all route names in application.
 */
export const RouteNames = {
    ClientRoot: 'ClientRoot',
    ...CategoryNames,
    ...GeneralViewNames,
    ...UserViewNames,
} as const

export type RouteName = keyof typeof RouteNames
