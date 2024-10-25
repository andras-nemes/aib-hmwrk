import type { LocaleOption } from 'lib/localization'

export enum StorageKey {
    MenuSticky = 'AIBIDIA_MENU_STICKY',
    Locale = 'AIBIDIA_LOCALE',
    Columns = 'AIBIDIA_COLUMNS',
    UrlSearchParam = 'AIBIDIA_URL_SEARCH_PARAM',
}

export const SupportedLocales: LocaleOption[] = [
    {
        Code: 'en',
        Name: 'English',
    },
]

export enum CellIcon {
    /** File download, 'fas fa-download' */
    Download = '\uf56d',
    /** Filled Speech bubble icon to indicate a comment in cell */
    EditComment = '\uf4ad',
    /** Arrows icon to indicate address form change */
    Exchange = '\uf362',
    /** Expand rows icon */
    Expand = '\uf067',
    /** Checkmark icon to display true value in a cell */
    Checkmark = '\uf00c',
    /** Manage ultimate parent: fa-sitemap */
    UltimateParent = '\uf0e8',
    /** Info icon */
    Info = '\uf05a',
    /** Edit icon: fas fa-edit */
    Edit = '\uf044',
}

export enum DateConversions {
    ToYearLast,
    ToYearFirst,
}

export enum ActionNames {
    Fetch = 'FETCH',
    Create = 'CREATE',
    Update = 'UPDATE',
    Delete = 'DELETE',
}

export enum HttpResponseType {
    Blob,
    Json,
    Text,
}

export enum ErrorMessageActions {
    Fetch = 'retrieving',
    Upsert = 'saving',
    Delete = 'removing',
    Sync = 'syncing',
}

export enum SnackbarTypes {
    Info = 'Info',
    Error = 'Error',
}

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

export enum ConfigurableColumnNamespace {}

export enum ColumnConfig {
    None,
    All,
    OnlySwitch,
}
