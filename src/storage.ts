import { initializeStatefulProperty } from "./state"
import { PropertyDecoratorContext } from "./types"
import { withObservationTracking } from "@webstd-ui/observable"
import { getViewContext } from "./view-context"

function initializeStorage(view: any, prop: string, key: string, storage: Storage) {
    let skipSave = true

    // try to hydrate state from storage:
    function load() {
        skipSave = true
        try {
            const item = storage.getItem(key)
            const stored = item ? JSON.parse(item) : null
            if (stored != null) {
                view[prop] = stored
            }
        } catch (err) {
            // ignore blocked storage access
        }
        skipSave = false
    }

    withObservationTracking(() => {
        const value = view[prop]
        if (skipSave) return
        try {
            storage.setItem(key, JSON.stringify(value))
        } catch (err) {
            // ignore blocked storage access
        }
    })

    // if another tab changes the launch tracking state, update our in-memory copy:
    if (typeof addEventListener === "function") {
        addEventListener("storage", event => {
            if (event.key === key) load()
        })
    }

    load()
}

export function AppStorage(key: string) {
    return (_target: undefined, context: PropertyDecoratorContext) => {
        if (context.static) {
            throw new Error("@AppStorage can only be applied to instance members.")
        }

        if (typeof context.name === "symbol") {
            throw new Error("@AppStorage cannot be applied to symbol-named properties.")
        }

        const prop = context.name
        getViewContext(context).addInitializer(ctx => {
            initializeStatefulProperty(prop, ctx.view)
            initializeStorage(ctx.view, prop, key, localStorage)
        })
    }
}

export function SessionStorage(key: string) {
    return (_target: undefined, context: PropertyDecoratorContext) => {
        if (context.static) {
            throw new Error("@SessionStorage can only be applied to instance members.")
        }

        if (typeof context.name === "symbol") {
            throw new Error("@SessionStorage cannot be applied to symbol-named properties.")
        }

        const prop = context.name
        getViewContext(context).addInitializer(ctx => {
            initializeStatefulProperty(prop, ctx.view)
            initializeStorage(ctx.view, prop, key, sessionStorage)
        })
    }
}
