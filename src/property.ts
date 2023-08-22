// @Property/@Attribute

import { View } from "@webstd-ui/view"
import { PropertyDecoratorContext } from "./types"
import { initializeStatefulProperty } from "./state"
import { getMetadataFromContext, getMetadataFromView } from "./utils"

/** @private */
const PropertySymbol = Symbol()

/** @private */
export type ExposedAttributes = { name: string; private: boolean }[]
/** @private */
export type ExposedProps = (Property.Options & { name: string })[]

/** @private */
export function exposeProperties(view: View, element: HTMLElement): ExposedAttributes {
    const exposedProps: ExposedProps = getMetadataFromView(view, PropertySymbol)

    for (const prop of exposedProps) {
        initializeStatefulProperty(prop.name, view)

        if (prop.public) {
            Object.defineProperty(element, prop.name, {
                get() {
                    return (view as any)[prop.name]
                },
                set(v) {
                    ;(view as any)[prop.name] = v
                },
            })
        }
    }

    const exposedAttrs = exposedProps
        .filter(prop => !!prop.attribute)
        .filter(Boolean)
        .map(prop => ({
            name: prop.attribute === true ? prop.name : (prop.attribute as string),
            private: !prop.public!,
        }))

    const ElementConstructor = Object.getPrototypeOf(element).constructor
    Object.defineProperty(ElementConstructor, "observedAttributes", {
        value: exposedAttrs.map(attr => attr.name),
    })

    return exposedAttrs
}

export namespace Property {
    export interface Options {
        attribute?: boolean | string
        public?: boolean
    }
}

/** @private */
const defaultPropertyOptions: Property.Options = {
    attribute: false,
    public: true,
}

/**
 * A decorator that exposes a property of a view to its parent HTMLElement. Also marks
 * the property as reactive, the same as `@State`.
 *
 * Use `@Property` when you want to be able to pass data into your custom element, e.g.
 * ```ts
 * \@Property() someValue?: number
 * ```
 *
 * ```html
 * <my-element .someValue=${123}></my-element>
 * ```
 */
export function Property(options: Property.Options = {}) {
    options.attribute ??= defaultPropertyOptions.attribute
    options.public ??= defaultPropertyOptions.public

    return (_target: undefined, context: PropertyDecoratorContext) => {
        if (context.static) {
            throw new Error("@Property can only be applied to instance members.")
        }

        if (typeof context.name === "symbol") {
            throw new Error("@Property cannot be applied to symbol-named properties.")
        }

        const exposedProps: ExposedProps = getMetadataFromContext(context, PropertySymbol)
        exposedProps.push({ name: context.name, ...options })
    }
}
