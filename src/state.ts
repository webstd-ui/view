import { atom } from "@webstd-ui/observable"
import { View } from "@webstd-ui/view"
import { PropertyDecoratorContext } from "./types"
import { getMetadataFromContext, getMetadataFromView } from "./utils"

// FIXME: This doesn't work for private properties

/** @private */
const StateSymbol = Symbol()

/** @private */
export function initializeStatefulProperty(prop: string, view: View) {
    let backingAtom = Symbol(`__$$${prop}`)

    Object.defineProperty(view, backingAtom, { value: atom((view as any)[prop]) })

    Object.defineProperty(view, prop, {
        get() {
            return (view as any)[backingAtom].value
        },
        set(v) {
            ;(view as any)[backingAtom].value = v
        },
    })
}

/** @private */
export function initializeStatefulProperties(view: View) {
    for (const prop of getMetadataFromView(view, StateSymbol)) {
        initializeStatefulProperty(prop, view)
    }
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

    const statefulProps: string[] = getMetadataFromContext(context, StateSymbol)
    statefulProps.push(context.name)
}
