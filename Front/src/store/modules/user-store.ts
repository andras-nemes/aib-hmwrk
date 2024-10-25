import { sortWith, ascend, descend, prop } from 'ramda'
import { StoreModule } from 'store/root-store/definition'
import type { UserPublic, User } from 'types/User'
import type { Tenant } from 'types/Tenant'
import type { UserPermissionUpdateMessage } from 'types/UserPermissionUpdateMessage'

type Getters = {
    /** List of users in the current tenants sorted for displaying */
    usersSorted: UserPublic[]
    /** Get list of accessible app of the current user */
    getUserApps: string[]
    /** Get DatabaseId of the current partner/tenant */
    getPartnerId: number
    /** Get Tenant by id */
    getPartnerById: (id: number) => Tenant | null
}

type State = {
    /** Is user logged in */
    loggedIn: boolean
    /** Current user's default partner */
    defaultPartner: Tenant | null
    /** Currently selected tenant metadata */
    partnerId: number | null
    /** List of all tenants available to the current user */
    partners: Tenant[]
    /** Current user metadata */
    user: User | null
    /** List of user in the current tenant */
    users: UserPublic[]
}

enum Mutations {
    LOGIN = 'LOGIN_USER',
    SET_PARTNER_ID = 'SET_PARTNER_ID',
    SET_PARTNERS = 'SET_PARTNERS',
    SET_USERS = 'SET_USERS',
    UPDATE_USER_APPS = 'UPDATE_USER_APPS',
}

enum Actions {
    FetchTenants = 'FetchTenants',
    FetchUsers = 'FetchUsers',
    UpdateUserStatuses = 'UpdateUserStatuses',
    UpdateUserApps = 'UpdateUserApps',
}

export const user = StoreModule<State, Getters>({
    state: {
        loggedIn: false,
        defaultPartner: null,
        partnerId: null,
        partners: [],
        user: null,
        users: [],
    },

    mutations: {
        /** Sets current user and turns on logged in status */
        [Mutations.LOGIN]: (state: State, user: User | null): void => {
            state.loggedIn = true
            state.user = user
        },

        /** Sets current tenant */
        [Mutations.SET_PARTNER_ID](state, data: number | null) {
            state.partnerId = data
        },

        /** Sorts and sets the list of tenants */
        [Mutations.SET_PARTNERS](state, partners: Tenant[]) {
            const otherPartners = partners.filter(partner => !partner.IsDefaultDatabase)
            state.partners = otherPartners.sort((a: Tenant, b: Tenant) =>
                a.WorkspaceName.localeCompare(b.WorkspaceName)
            )

            state.defaultPartner = partners.find(partner => partner.IsDefaultDatabase) || null
        },

        /** Sets the list of users in the current tenant */
        [Mutations.SET_USERS](state, users: UserPublic[]) {
            state.users = users
        },

        [Mutations.UPDATE_USER_APPS](state: State, apps: string[]): void {
            if (state.user) {
                state.user.AppCodes = apps
            }
        },
    },

    getters: {
        usersSorted: state =>
            sortWith<UserPublic>([descend(prop('IsOnline')), ascend(prop('ShortName'))])(
                state.users
            ),

        getUserApps: state => {
            return state.user?.AppCodes || []
        },

        getPartnerId: state => {
            return state.partnerId || state.defaultPartner?.DatabaseId || -1
        },

        getPartnerById: state => id => {
            return state.partners.find(pt => pt.DatabaseId === id) || null
        },
    },

    actions: {
        /** Loads list of tenants from backend and puts them to store */
        [Actions.FetchTenants]: async function ({ commit }) {
            try {
                const tenant = {
                    DatabaseId: 2,
                    WorkspaceName: 'Test',
                    IsDefaultDatabase: true,
                    TenantName: 'Test',
                    AccountName: 'Test',
                }

                commit(Mutations.SET_PARTNERS, [tenant])
            } catch (error: unknown) {
                console.log('Could not load tenants', error)
            }
        },

        /** Updates online statuses of the users in the tenant. */
        [Actions.UpdateUserStatuses]: async function ({ state, commit }, onlineUsersIds: string[]) {
            // Copy current list of users setting them all as offline
            const users = state.users.map(user => {
                return {
                    ...user,
                    IsOnline: false,
                }
            })

            // Set online for the users from the input list
            for (const userId of onlineUsersIds) {
                const ind = users.findIndex(u => u.UserId === userId)
                if (ind > -1) {
                    users[ind].IsOnline = true
                }
            }

            // Replace the existing list of users
            commit(Mutations.SET_USERS, users)
        },

        [Actions.UpdateUserApps]: async (
            context,
            notification: UserPermissionUpdateMessage
        ): Promise<void> => {
            if (notification && Array.isArray(notification.AppCodes)) {
                context.commit(Mutations.UPDATE_USER_APPS, notification.AppCodes || [])
            }
        },
    },
})

export type UserState = State
export type UserGetters = Getters
export { Actions as UserActions }
export { Mutations as UserMutations }
