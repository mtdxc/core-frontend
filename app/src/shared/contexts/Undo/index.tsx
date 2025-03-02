/* eslint-disable react/no-unused-state */
import type { Context, ReactNode } from 'react'
import React, { Component } from 'react'
import t from 'prop-types'
import useUndoBreadcrumbs from './useUndoBreadcrumbs'
type Action = {
    type: string
    [key: string]: any
}
type HistoryItem = {
    action: Action
    state: Record<string, any>
}
export type UndoContextProps = {
    history: Array<HistoryItem>
    pointer: number
    undo: (...args: Array<any>) => any
    redo: (...args: Array<any>) => any
    push: (
        action: Action | string,
        fn: (...args: Array<any>) => any,
        done?: ((...args: Array<any>) => any) | null | undefined,
    ) => any
    replace: (fn: (...args: Array<any>) => any, done?: ((...args: Array<any>) => any) | null | undefined) => any
    reset: (...args: Array<any>) => any
    action: Action
    state: Record<string, any> | null | undefined
    initialState?: any
    setInitialState: (fn: (...args: Array<any>) => any, done?: ((...args: Array<any>) => any) | null | undefined) => any
}
export const initialAction = {
    type: '__INIT',
}
const UndoContext: Context<UndoContextProps> = React.createContext({
    action: initialAction,
    initialState: undefined,
    state: undefined,
    history: [],
    pointer: 0,
    undo: () => {},
    redo: () => {},
    push: () => {},
    replace: () => {},
    reset: () => {},
    setInitialState: () => {},
})

/*
 * History implemented as an array of states &
 * a pointer to the index of the current state.
 * Undo/redo does nothing but move pointer forward and backward.
 */
type Props = {
    children?: ReactNode
    enableBreadcrumbs?: boolean
}
type State = UndoContextProps

class UndoContextProvider extends Component<Props, State> {
    static Context = UndoContext
    static Consumer = UndoContext.Consumer
    static propTypes = {
        children: t.node.isRequired,
    }

    static getDerivedStateFromProps(props: Props, state: State): State {
        const nextState = { ...state }

        if (!state.history.length) {
            // initialise with first 'initialState'
            Object.assign(nextState, {
                history: [
                    {
                        state: state.initialState,
                        action: initialAction,
                    },
                ],
                pointer: 0,
            })
        }

        return Object.assign(nextState, {
            ...nextState.history[nextState.pointer],
        })
    }

    componentWillUnmount(): void {
        this.unmounted = true
    }

    unmounted = false

    /*
     * Move history pointer back.
     */
    undo = (done: (...args: Array<any>) => any): Promise<any> => {
        const p: Promise<Record<string, any> | null> = new Promise((resolve) =>
            this.setState(({ history, pointer }) => {
                if (this.unmounted) {
                    return null
                }

                const nextPointer = pointer - 1

                if (!history[nextPointer]) {
                    return null
                } // no more undos

                return {
                    pointer: nextPointer,
                }
            }, resolve as () => void),
        )
        p.then(done)
        return p
    }

    /*
     * Move history pointer forward.
     */
    redo = (done: (...args: Array<any>) => any): Promise<any> => {
        const p: Promise<Record<string, any> | null> = new Promise((resolve) =>
            this.setState(({ history, pointer }) => {
                if (this.unmounted) {
                    return null
                }

                const nextPointer = pointer + 1

                if (!history[nextPointer]) {
                    return null
                } // no more redos

                return {
                    pointer: nextPointer,
                }
            }, resolve as () => void),
        )
        p.then(done)
        return p
    }

    /*
     * Push new history item. Immutably merges next state with
     * previous to allow partial updates ala React.Component#setState.
     * Noops if next state is strict equal to prev or null.
     */
    push = (actionValue: string | Action, fn: (...args: Array<any>) => any, done: (...args: Array<any>) => any): Promise<any> => {
        // convert action string to action object
        const action =
            typeof actionValue !== 'string'
                ? actionValue
                : {
                    type: actionValue,
                }
        const p: Promise<Record<string, any> | null> = new Promise((resolve) =>
            this.setState(({ history, pointer }) => {
                if (this.unmounted) {
                    return null
                }

                const prevHistory = history[pointer]
                const prevState = prevHistory && prevHistory.state
                const nextState = fn(prevState)

                // no update if same or null
                if (nextState === null || nextState === prevState) {
                    return null
                }

                const nextHistoryItem = {
                    action,
                    state: nextState,
                }
                // remove trailing redos & add history item
                const nextHistory = history.slice(0, pointer + 1).concat(nextHistoryItem)
                return {
                    history: nextHistory,
                    pointer: nextHistory.length - 1,
                }
            }, resolve as () => void),
        )
        p.then(done)
        return p
    }

    /*
     * Replace top history item.
     * Noops if next state is strict equal to prev or null.
     * No merge, only replace ala React.Component#replaceState.
     */
    replace = (fn: (...args: Array<any>) => any, done: (...args: Array<any>) => any): Promise<any> => {
        const p: Promise<Record<string, any> | null> = new Promise((resolve) =>
            this.setState(({ history, pointer }) => {
                if (this.unmounted) {
                    return null
                }

                const prevHistory = history[pointer]
                const prevState = prevHistory && prevHistory.state
                const nextState = fn(prevState)

                // no update if same or null
                if (nextState === null || nextState === prevState) {
                    return null
                }

                const nextHistory = history.slice()
                nextHistory[pointer] = { ...prevHistory, state: nextState }
                return {
                    history: nextHistory,
                }
            }, resolve as () => void),
        )
        p.then(done)
        return p
    }

    /**
     * Set initialState which is used as the "reset" state value
     */
    setInitialState = (fn: (...args: Array<any>) => any, done?: (...args: Array<any>) => any): Promise<any> => {
        const p: Promise<void> = new Promise((resolve) =>
            this.setState(({ initialState }) => {
                const nextInitialState = typeof fn === 'function' ? fn(initialState) : initialState
                return {
                    initialState: nextInitialState,
                }
            }, resolve as () => void),
        )
        p.then(done)
        return p
    }

    /**
     * Reset to initialState
     */
    reset = (done: (...args: Array<any>) => any): Promise<any> => {
        const p: Promise<void> = new Promise((resolve) =>
            this.setState(
                ({ initialState }) => ({
                    history: [
                        {
                            state: initialState,
                            action: initialAction,
                        },
                    ],
                    pointer: 0,
                }),
                resolve,
            ),
        )
        p.then(done)
        return p
    }
    // eslint-disable-next-line react/sort-comp
    state: State = {
        history: [],
        pointer: 0,
        undo: this.undo,
        redo: this.redo,
        push: this.push,
        replace: this.replace,
        reset: this.reset,
        state: undefined,
        action: initialAction,
        initialState: undefined,
        setInitialState: this.setInitialState,
    }

    render(): ReactNode {
        const { enableBreadcrumbs, children, ...props } = this.props
        return (
            <UndoContext.Provider {...props} value={this.state}>
                <UndoBreadcrumbs enableBreadcrumbs={enableBreadcrumbs} />
                {children || null}
            </UndoContext.Provider>
        )
    }
}

function UndoBreadcrumbs({ enableBreadcrumbs }: {enableBreadcrumbs: boolean}): null {
    useUndoBreadcrumbs(enableBreadcrumbs)
    return null
}

export { UndoContextProvider as Provider, UndoContext as Context }
