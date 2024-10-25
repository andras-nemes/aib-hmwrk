type TimerHandle = number

export enum AppLoadingMessages {
    Loading = 'Loading...',
    Error = 'Could not load data. Please try again later.',
    AccessDenied = 'Access Denied',
    RedirectingToWorkspace = 'Redirecting to default Workspace...',
    LoggingOut = 'Logging out...',
}

export enum LoginPageMode {
    Login,
    NotAuthorised,
}

/** Interface for App loader error message object */
export interface AppLoadingError {
    /** Status number from request */
    status?: number
    /** Message to show as error message */
    message: string
}

export interface Data {
    /** Should we show notification for user if the loading takes too long */
    showNotification: boolean
    /** Internal timer for notification shower */
    showNotificationTimeout: TimerHandle | null
}

export interface Computed {
    /** Should animation be applied to the text */
    isAnimated: boolean
}

export interface Props {
    /** Message to display on loader screen */
    message: AppLoadingMessages
    /** Error message to display on loader screen */
    error: AppLoadingError | null
    /** How long to load before showing unusual loading notification message */
    notificationDelay: number
}
