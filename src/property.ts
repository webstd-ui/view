import { PropertyDecoratorContext } from "./types"
import { initializeStatefulProperty } from "./state"
import { getViewContext } from "./internals/view-context"
import { getMetadataFromContext, getMetadataFromView, setMetadataOnView } from "./internals/utils"

type Attribute = { propName: string; name: string; private: boolean }
type Prop = Property.Options & { name: string }

const AttributesSymbol = Symbol()
const AttributesInstalledSymbol = Symbol()

export namespace Property {
    export interface Options {
        attribute?: boolean | string
        public?: boolean
    }
}

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

        const name = context.name
        getViewContext(context).addInitializer(ctx => {
            exposeProperty({ name, ...options }, context, ctx.view, ctx.element)
            if (!!options.attribute) initializeAttributeObservation(ctx.view, ctx.element)
        })
    }
}

function exposeProperty(prop: Prop, context: any, view: any, element: HTMLElement) {
    initializeStatefulProperty(prop.name, view)

    if (prop.public) {
        // Expose the stateful property on the HTMLElement if the property
        // is set to public
        Object.defineProperty(element, prop.name, {
            get() {
                return view[prop.name]
            },
            set(v) {
                view[prop.name] = v
            },
        })
    }

    // prop.attribute is truthy
    if (!!prop.attribute) {
        const attr: Attribute = {
            propName: prop.name,
            name: prop.attribute === true ? prop.name : (prop.attribute as string),
            private: !prop.public!,
        }

        const observedAttributes = getMetadataFromContext<Attribute[]>(
            context,
            AttributesSymbol,
            []
        )
        observedAttributes.push(attr)
    }
}

function initializeAttributeObservation(view: any, element: any) {
    const attributesAreInstalled = getMetadataFromView<boolean>(
        view,
        AttributesInstalledSymbol,
        false
    )

    if (!attributesAreInstalled) {
        let observer = new MutationObserver(changeSet => {
            const observedAttributes = getMetadataFromView<Attribute[]>(view, AttributesSymbol, [])
            const attrs = observedAttributes.map($0 => $0.name)
            let observedChanges = changeSet.filter($0 => attrs.includes($0.attributeName ?? ""))

            // If we don't have anything to observe, bail before looping
            if (!observedChanges.length) return

            for (let change of observedChanges) {
                let attr: Attribute | undefined
                if ((attr = observedAttributes.find(attr => attr.name === change.attributeName))) {
                    // TODO: Transform value based on decorator metadata
                    if (attr.private) {
                        // If the attribute is private, update the property on the view
                        view[attr.propName] = (change.target as HTMLElement).getAttribute(
                            change.attributeName!
                        )
                    } else {
                        // If the attribute is public, update the bound property on the element
                        element[attr.propName] = (change.target as HTMLElement).getAttribute(
                            change.attributeName!
                        )
                    }
                }
            }
        })

        observer.observe(element, { attributes: true })

        setMetadataOnView(view, AttributesInstalledSymbol, true)
    }
}
