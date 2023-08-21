import { atom } from "@webstd-ui/observable"
import { View } from "."

// FIXME: This doesn't work for private properties

type PropertyContext =
    | ClassAccessorDecoratorContext
    | ClassGetterDecoratorContext
    | ClassFieldDecoratorContext

const StateSymbol = Symbol()

export function initializeStatefulProperties(instance: View) {
    const prototype = Object.getPrototypeOf(instance)
    const metadata = prototype.constructor[(Symbol as any).metadata]
    const statefulProps: string[] = (metadata[StateSymbol] ??= [])

    for (const prop of statefulProps) {
        let v = (instance as any)[prop]
        let backingAtom = Symbol(`__$$${prop}`)

        Object.defineProperty(instance, backingAtom, { value: atom(v) })

        Object.defineProperty(instance, prop, {
            get() {
                return (instance as any)[backingAtom].value
            },
            set(v) {
                ;(instance as any)[backingAtom].value = v
            },
        })
    }
}

export function State(_target: undefined, context: PropertyContext) {
    if (context.static) {
        throw new Error("@State can only be applied to instance members.")
    }

    if (typeof context.name === "symbol") {
        throw new Error("@State cannot be applied to symbol-named properties.")
    }

    const metadata = (context as any).metadata
    const statefulProps: string[] = (metadata[StateSymbol] ??= [])
    statefulProps.push(context.name)
}
