import { TemplateResult, render } from "lit-html"
import { withObservationTracking } from "@webstd-ui/observable"
import { ViewConstructor } from "./types"
import { initializeStatefulProperties } from "./state"
import { ExposedAttributes, exposeProperties } from "./property"
import { EnvironmentDispatches, bindEnvironmentValues } from "./environment"

/**
 * A type that represents part of your app's user interface and provides
 * modifiers that you use to configure views.
 *
 * @remarks
 * You create custom views by declaring types that conform to the `View`
 * interface. Implement the required `View.body` computed property to provide
 * the HTML content for your custom view.
 *
 * @example
 * ```ts
 * \@CustomElement("my-view")
 * class MyView implements View {
 *      get body() {
 *          return html`Hello, World!`
 *      }
 * }
 * ```
 *
 * Assemble the view's body by combining one or more built-in HTML elements,
 * like the text node in the example above, plus other custom elements that you register,
 * into a hierarchy of elements. For more information about creating custom elements, see
 * <doc:Declaring-a-Custom-View>.
 */
export interface View {
    readonly body: TemplateResult

    onAppear?: () => void
    onDisappear?: () => void
    task?: () => Promise<void>
    // observedTask?: () => Promise<void>
}

/**
 * A decorator that creates a [custom element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
 * from a `View` class.
 *
 * @param tagName - the custom element tag name that this view will be registered as
 */
export function CustomElement<ViewCtor extends ViewConstructor>(tagName: string) {
    return (View: ViewCtor, context: ClassDecoratorContext) => {
        const CustomElement = buildElementFromView(View)
        context.addInitializer(() => customElements.define(tagName, CustomElement))
    }
}

/** @private */
export function buildElementFromView(View: ViewConstructor): CustomElementConstructor {
    return class extends HTMLElement {
        #root: ShadowRoot
        #view: View
        #attrs: ExposedAttributes
        #dispatchables: EnvironmentDispatches

        constructor() {
            super()
            this.#root = this.attachShadow({ mode: "open" })
            this.#view = new View(this)
            this.#attrs = exposeProperties(this.#view, this)
            this.#dispatchables = bindEnvironmentValues(this.#view, this)
            initializeStatefulProperties(this.#view)
        }

        attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
            let attr: { name: string; private: boolean } | undefined
            if ((attr = this.#attrs.find(attr => attr.name === name))) {
                // TODO: Transform value based on decorator metadata
                if (attr.private) {
                    // If the attribute is private, update the property on the view
                    ;(this.#view as any)[name] = newValue
                } else {
                    // If the attribute is public, update the bound property on the element
                    ;(this as any)[name] = newValue
                }
            }
        }

        connectedCallback() {
            this.#view.onAppear?.()

            if (typeof document !== undefined) {
                // `task` only runs on the client
                this.#view.task?.()

                // TODO: `observedTask`?
                // withObservationTracking(() => {
                //     this.#view.observedTask?.()
                // })
            }

            for (const dispatch of this.#dispatchables) {
                dispatch()
            }

            withObservationTracking(() => {
                // Render view.body into the shadow root every time data view.body
                // depends on changes.
                render(this.#view.body, this.#root)
            })
        }

        disconnectedCallback() {
            this.#view.onDisappear?.()
        }
    }
}
