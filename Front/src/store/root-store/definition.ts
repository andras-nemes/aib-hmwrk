import type {
    Dispatch,
    ActionContext as VuexActionContext,
    Module as VueXModule,
    Store,
    Commit,
} from 'vuex'
import type { RootGetters, RootState } from './modules'

/** Type extension for ActionContext which extends VueX Action Context with Solution specific RootState and Getters */
export interface ActionContext<S, G> extends VuexActionContext<S, RootState> {
    dispatch: Dispatch
    commit: Commit
    state: S
    getters: G
    rootState: RootState
    rootGetters: RootGetters
}

/** Type override for ActionHandler which uses Solution specific RootState and RootGetters */
export type ActionHandler<S, RootState> = (
    this: Store<RootState>,
    injectee: ActionContext<S, RootGetters>,
    payload?: any
) => Promise<any>

/** Interfaced type safe getters */
export type MappedGetters<S, G, RootGetters> = {
    [P in keyof G]: (state: S, getters: RootGetters) => G[P]
}

/** Interfaced type safe mutations */
export type MappedMutations<S> = {
    [P: string]: (state: S, data: any) => void
}

/** Interfaced type safe actions */
export type MappedActions<S> = {
    [P: string]: ActionHandler<S, RootState>
}

/** Solution module specification */
export type IStoreModuleDef<S, G> = {
    state: S
    getters?: MappedGetters<S, G, RootGetters>
    mutations: MappedMutations<S>
    actions: MappedActions<S>
}

/** Generator wrapper which does nothing but enforce types */
export function StoreModule<State, Getters>(
    props: IStoreModuleDef<State, Getters>
): VueXModule<State, RootState> {
    return props
}
