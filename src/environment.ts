import { Observable, ObservationIgnored, withObservationTracking } from "@webstd-ui/observable"
import { View, html, Property, CustomElement } from "@webstd-ui/view"
import { Context, ContextCallback, ContextEvent, createContext } from "./internals/context"
import { PropertyDecoratorContext } from "./types"
import { getViewContext } from "./internals/view-context"

/** @private */
@Observable
export class EnvironmentConsumer<Data extends NonFunction> {
    #key: EnvironmentKey<Data>
    #host: HTMLElement

    data: Data | undefined

    constructor(key: EnvironmentKey<Data>, host: HTMLElement) {
        this.#host = host
        this.#key = key
    }

    // @ObservationIgnored
    dispatch = () => {
        const event = new ContextEvent(this.#key.context, value => (this.data = value))
        this.#host.dispatchEvent(event)
    }
}

/** @private */
export class EnvironmentProvider<Data extends NonFunction> {
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

    provide(value: Data) {
        this.#latestData = value

        for (const callback of this.#callbacks) {
            // Notify all registered children of the new value
            callback(value)
        }
    }

    constructor(key: EnvironmentKey<Data>, host: HTMLElement) {
        this.#latestData = key.context.initialValue

        host.addEventListener("context-request", (event: ContextEvent<Context<Data>>) => {
            // Is this the context we're looking for?
            if (event.context.name === key.context.name) {
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

type primitive = bigint | boolean | null | number | string | symbol | undefined
type NonFunction = object | primitive

/**
 * A key for accessing values in the environment.
 *
 * You can create custom environment keys by creating instances of the
 * `EnvironmentKey` class. First create a new environment key instance
 * and specify a value for the required `key` and `defaultValue` properties.
 */
export class EnvironmentKey<Value extends NonFunction> {
    context: Context<Value>

    constructor({
        key,
        defaultValue,
        createProvider = true,
    }: {
        key: string
        defaultValue: Value | (() => Value)
        createProvider?: boolean
    }) {
        const ctx = createContext(
            key,
            typeof defaultValue === "function" ? defaultValue() : defaultValue
        )
        this.context = ctx

        if (createProvider) {
            @CustomElement(key)
            class EnvironmentProviderView implements View {
                @Property() value: Value

                constructor() {
                    this.value = typeof defaultValue === "function" ? defaultValue() : defaultValue

                    getViewContext(this).onAppear(event => {
                        const provider = new EnvironmentProvider({ context: ctx }, event.element)
                        withObservationTracking(() => provider.provide(this.value))
                    })
                }

                get body() {
                    return html`<slot></slot>`
                }
            }
        }
    }
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
export function Environment<Value extends NonFunction>(key: EnvironmentKey<Value>) {
    return (_target: undefined, context: PropertyDecoratorContext) => {
        if (context.static) {
            throw new Error("@Environment can only be applied to instance members.")
        }

        if (typeof context.name === "symbol") {
            throw new Error("@Environment cannot be applied to symbol-named properties.")
        }

        const viewContext = getViewContext(context)
        let consumer!: EnvironmentConsumer<Value>

        viewContext.addInitializer(ctx => {
            consumer = new EnvironmentConsumer(key, ctx.element)

            Object.defineProperty(ctx.view, context.name, {
                get() {
                    return consumer.data
                },
            })
        })

        viewContext.onAppear(() => consumer.dispatch())
    }
}
