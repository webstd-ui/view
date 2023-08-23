import { atom } from "@webstd-ui/observable"
import { PropertyDecoratorContext } from "./types"
import { getViewContext } from "./internals/view-context"

// FIXME: This doesn't work for private properties

/** @private */
export function initializeStatefulProperty(prop: string, view: any) {
    let backingAtom = Symbol(`__$${prop}`)

    Object.defineProperty(view, backingAtom, { value: atom(view[prop]) })

    Object.defineProperty(view, prop, {
        get() {
            return view[backingAtom].value
        },
        set(v) {
            view[backingAtom].value = v
        },
    })
}

/**
 * A decorator that can read and write a stateful value.
 *
 * Use state as the single source of truth for a given value that you
 * store in a view hierarchy. Create a state value in a View by applying
 * the `@State` decorator to a property declaration and providing an initial value.
 */
export function State(_target: undefined, context: PropertyDecoratorContext) {
    if (context.static) {
        throw new Error("@State can only be applied to instance members.")
    }

    if (typeof context.name === "symbol") {
        throw new Error("@State cannot be applied to symbol-named properties.")
    }

    const prop = context.name
    getViewContext(context).addInitializer(ctx => {
        initializeStatefulProperty(prop, ctx.view)
    })
}
