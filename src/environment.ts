import { Observable, ObservationIgnored, withObservationTracking } from "@webstd-ui/observable"
import { View, html, Property, CustomElement } from "@webstd-ui/view"
import { Context, ContextCallback, ContextEvent, createContext } from "./context"
import { PropertyDecoratorContext } from "./types"
import { getMetadataFromContext, getMetadataFromView } from "./utils"

/** @private */
@Observable
export class EnvironmentConsumer<Data> {
    @ObservationIgnored #context: Context<Data>
    @ObservationIgnored #host: HTMLElement
    data: Data | undefined

    constructor(context: Context<Data>, host: HTMLElement) {
        this.#host = host
        this.#context = context
    }

    @ObservationIgnored
    dispatch = () => {
        const event = new ContextEvent(this.#context, value => (this.data = value))
        this.#host.dispatchEvent(event)
    }
}

/** @private */
export class EnvironmentProvider<Data> {
    #latestData: Data
    #callbacks: ContextCallback<Data>[] = []

    get data() {
        return this.#latestData
    }

    set data(newValue: Data) {
        this.#latestData = newValue

        for (const callback of this.#callbacks) {
            // Notify all registered children of the new value
            callback(newValue)
        }
    }

    constructor(context: Context<Data>, host: HTMLElement) {
        this.#latestData = context.initialValue

        host.addEventListener("context-request", (event: ContextEvent<Context<Data>>) => {
            // Is this the context we're looking for?
            if (event.context.name === context.name) {
                // Stop propagation to scope this context request to its nearest parent
                event.stopPropagation()
                // Provide the context request with the latest data available immediately
                event.callback(this.#latestData)
                // Save the context request callback to update it every time `data` is set
                this.#callbacks.push(event.callback)
            }
        })
    }
}

/**
 * A key for accessing values in the environment.
 *
 * You can create custom environment keys by creating instances of the
 * `EnvironmentKey` class. First create a new environment key instance
 * and specify a value for the required `key` and `defaultValue` properties.
 */
export class EnvironmentKey<Value> {
    context: Context<Value>

    constructor({ key, defaultValue }: { key: string; defaultValue: Value }) {
        const ctx = createContext(key, defaultValue)
        this.context = ctx

        @CustomElement(key)
        class EnvironmentProviderView implements View {
            #element: HTMLElement
            @Property() value: Value

            constructor(element: HTMLElement) {
                this.#element = element
                this.value = defaultValue
            }

            onAppear() {
                const provider = new EnvironmentProvider(ctx, this.#element)

                withObservationTracking(() => {
                    provider.data = this.value
                })
            }

            get body() {
                return html`<slot></slot>`
            }
        }
    }
}

/** @private */
const EnvironmentSymbol = Symbol()

/** @private */
type EnvironmentBindings<Value> = { propName: string; context: Context<Value> }[]

/** @private */
export type EnvironmentDispatches = (() => void)[]

/** @private */
export function bindEnvironmentValues(view: View, element: HTMLElement): EnvironmentDispatches {
    const environmentBindings: EnvironmentBindings<any> = getMetadataFromView(
        view,
        EnvironmentSymbol
    )

    const dispatches: EnvironmentDispatches = []

    for (const binding of environmentBindings) {
        let consumer = new EnvironmentConsumer(binding.context, element)
        dispatches.push(consumer.dispatch)

        Object.defineProperty(view, binding.propName, {
            get() {
                return consumer.data
            },
        })
    }

    return dispatches
}

/**
 * A decorator that reads a value from a view's environment.
 *
 * Use the `Environment` decorator to read a value stored in a view's environment.
 * Indicate the value to read using an `EnvironmentKey` for the decorator's argument.
 * For example, you can create a property that reads the color scheme of the current
 * view using the key path of the `ColorSchemeKey` EnvironmentKey:
 *
 * @example
 * ```ts
 * \@Environment(ColorSchemeKey) colorScheme?: ColorScheme
 * ```
 */
export function Environment<Value>(key: EnvironmentKey<Value>) {
    return (_target: undefined, context: PropertyDecoratorContext) => {
        if (context.static) {
            throw new Error("@Environment can only be applied to instance members.")
        }

        if (typeof context.name === "symbol") {
            throw new Error("@Environment cannot be applied to symbol-named properties.")
        }

        const environmentBindings: EnvironmentBindings<Value> = getMetadataFromContext(
            context,
            EnvironmentSymbol
        )
        environmentBindings.push({ propName: context.name, context: key.context })
    }
}
